import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import File from '../models/file.js';
import crypto from 'crypto';
import fs from 'fs';
import copyfiles from 'copyfiles';
import { fileURLToPath } from 'url';

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
      return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
    } catch (err: any) {
      return res.status(500).send({ error: err.message });
    }
  });
}

export async function showFile(req: Request, res: Response) {
  try {
    // copyfiles(['views/download.ejs', 'public/*', 'dist'], () => {
    //   console.log('⚡️[server]: views/download.ejs successfully copied to "dist" folder.');
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
