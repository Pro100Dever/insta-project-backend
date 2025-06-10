import { IsNotEmpty, IsString } from "class-validator";

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  otherUserId!: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  chatId!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
