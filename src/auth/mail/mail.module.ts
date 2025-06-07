import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";

@Module({
  providers: [MailService],
  exports: [MailService], // чтобы можно было использовать в других модулях
})
export class MailModule {}
