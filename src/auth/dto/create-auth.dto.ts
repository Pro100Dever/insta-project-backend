import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from "class-validator";

export class CreateAuthDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @Length(4, 50)
  email: string;
  @IsNotEmpty()
  @IsString()
  @Length(4, 50)
  fullName: string;
  @IsNotEmpty()
  @Length(4, 50)
  username: string;
  @IsNotEmpty()
  @Length(8, 50)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/, {
    message:
      "Пароль должен содержать минимум 8 символов, хотя бы одну заглавную букву, одну цифру и один специальный символ",
  })
  password: string;
}
export class LoginData {
  @IsString()
  @IsNotEmpty()
  login: string; // email or username
  @IsNotEmpty()
  password: string;
}
export class NewPassBody {
  @IsString()
  @IsNotEmpty()
  token: string;
  @IsNotEmpty()
  @Length(8, 50)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/, {
    message:
      "Пароль должен содержать минимум 8 символов, хотя бы одну заглавную букву, одну цифру и один специальный символ",
  })
  newPassword: string;
}
