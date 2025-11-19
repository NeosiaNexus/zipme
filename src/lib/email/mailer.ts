import { createTransport } from 'nodemailer';

const mailer = createTransport({
  host: process.env.MAILER_HOST!,
  port: Number(process.env.MAILER_PORT!),
  secure: process.env.MAILER_SECURE! === 'true',
  auth: {
    user: process.env.MAILER_AUTH_USER!,
    pass: process.env.MAILER_AUTH_PASS!,
  },
});

export default mailer;
