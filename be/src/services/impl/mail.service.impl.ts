import { IMailService } from "@services/mail.service";
import nodemailer from "nodemailer";

class MailServiceImpl implements IMailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      secure: false,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_APP_USERNAME,
        pass: process.env.MAIL_APP_PASSWORD,
      },
    });
  }

  async sendMail(option: nodemailer.SendMailOptions): Promise<any> {
    return this.transporter.sendMail(option);
  }

  async sendMailVerificationCode(to: string, code: string): Promise<any> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: "The Fashion App",
      to: to,
      subject: "Email Verification Code - The Fashion App",
      html: `<p>Your email verification code is: <b>${code}</b></p>
            <br/>
            <p>Expire in 15 minutes</p>`,
    };

    return this.sendMail(mailOptions);
  }
}

export default new MailServiceImpl();
