import nodemailer from "nodemailer";

export interface IMailService {
  sendMail(option: nodemailer.SendMailOptions): Promise<any>;
  sendMailVerificationCode(to: string, code: string): Promise<any>;
}
