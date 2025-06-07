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
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: `"YourApp 👋" <${this.config.get<string>("EMAIL_USER")}>`,
        to,
        subject: "Сброс пароля",
        html: `
        <h2>Сброс пароля</h2>
        <p>Нажмите на кнопку ниже, чтобы сбросить пароль:</p>
        <a href="${resetUrl}" target="_blank">Сбросить пароль</a>
        <p>Если вы не запрашивали сброс пароля — просто игнорируйте это письмо.</p>
      `,
      });
    } catch (error: unknown) {
      console.error("Ошибка при отправке письма:", error);
      throw new InternalServerErrorException("Ошибка при отправке email");
    }
  }
}
