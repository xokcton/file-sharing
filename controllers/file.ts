import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import File from '../models/file.js';
import crypto from 'crypto';
import fs from 'fs';
import copyfiles from 'copyfiles';
import { fileURLToPath } from 'url';
import sendMail from '../services/emailService.js';
import emailTemplate from '../services/emailTemplate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (_, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
      file.originalname,
    )}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage, limits: { fileSize: 1e6 * 1e2 } }).single('myfile');

export function saveFile(req: Request, res: Response) {
  upload(req, res, async (err) => {
    if (!req.file) {
      return res.json({ error: 'All fields are required!' });
    }

    if (err) {
      return res.status(500).send({ error: err.message });
    }

    const file = new File({
      filename: req.file?.filename,
      path: req.file?.path,
      size: req.file?.size,
      uuid: crypto.randomUUID(),
    });

    try {
      const response = await file.save();
      copyfiles(['uploads/*', 'dist'], () => {
        console.log('⚡️[server]: [uploads/*] successfully copied to "dist" folder.');
      });
      return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
    } catch (err: any) {
      return res.status(500).send({ error: err.message });
    }
  });
}

export async function showFile(req: Request, res: Response) {
  try {
    // copyfiles(['views/download.ejs', 'public/*', 'uploads/*', 'dist'], () => {
    // console.log(
    //   '⚡️[server]: [views/download.ejs], [public/*], [uploads/*] successfully copied to "dist" folder.',
    // );
    // });

    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
      return res.render('download', { error: 'Link has been expired.' });
    }

    return res.render('download', {
      uuid: file.uuid,
      fileName: file.filename,
      fileSize: file.size,
      downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`,
    });
  } catch (err) {
    return res.render('download', { error: 'Something went wrong!' });
  }
}

export async function downloadFile(req: Request, res: Response) {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
      return res.render('download', { error: 'Link has been expired.' });
    }

    const filePath = `${__dirname}/../${file.path}`;
    res.download(filePath);
  } catch (error) {
    return res.render('download', { error: 'Something went wrong!' });
  }
}

export async function sendFile(req: Request, res: Response) {
  try {
    const { uuid, emailTo, emailFrom } = req.body;

    if (!uuid || !emailTo || !emailFrom) {
      return res.status(422).send({ error: 'All fields are required!' });
    }

    const file = await File.findOne({ uuid });
    if (!file) {
      return res.status(422).send({ error: 'Link has been expired.' });
    }

    if (file?.sender) {
      return res.status(422).send({ error: 'Email already sent.' });
    }

    file!.sender = emailFrom;
    file!.receiver = emailTo;
    await file.save();
    sendMail({
      from: emailFrom,
      to: emailTo,
      subject: 'File Share app',
      text: `${emailFrom} shared a file with you.`,
      html: emailTemplate({
        emailFrom,
        downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
        size: file.size / 1000 + ' KB',
        expires: '24 hours',
      }),
    });

    return res.send({ success: 'Email has been successfully sent.' });
  } catch (err: any) {
    return res.status(500).send({ error: err.message });
  }
}
