import nodemailer, { TransportOptions } from 'nodemailer';

interface ISendMail {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

export default async function sendMail({ from, to, subject, text, html }: ISendMail) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  } as TransportOptions);

  await transporter.sendMail({
    from: `File Sharer <${from}>`,
    to,
    subject,
    text,
    html,
  });
}
