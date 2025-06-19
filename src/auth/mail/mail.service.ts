import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.config.get<string>("EMAIL_USER"),
        pass: this.config.get<string>("EMAIL_PASS"),
      },
    });
  }

  async sendResetPasswordEmail(to: string, token: string) {
    const FRONTEND_URL = this.config.get<string>("FRONTEND_URL");
    const resetUrl = `${FRONTEND_URL}/new-password?token=${token}`; //токен на фронт идет через парам но в ресет пас его пихаем в боди

    try {
      await this.transporter.sendMail({
        from: `"YourApp 👋" <${this.config.get<string>("EMAIL_USER")}>`,
        to,
        subject: "Reset password",
        html: `
        <h2>Reset password</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">Reset password</a>
        <p>If you did not request a password reset, simply ignore this email.</p>
      `,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      throw new InternalServerErrorException("Error sending email");
    }
  }
  async confirmResetPasswordEmail(to: string) {
    try {
      await this.transporter.sendMail({
        from: `"YourApp 👋" <${this.config.get<string>("EMAIL_USER")}>`,
        to,
        subject: "Password was changed",
        html: `
        <p>Hello,</p>
        <br>
        <p>The password for your Instagram account was recently changed. If you made this change, you don't need to do anything.</p>
        <br>
        <p>If you did not change your password, someone may have gained access to your account. Please, reset your password again</p>
      `,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      throw new InternalServerErrorException("Error sending email");
    }
  }
}
