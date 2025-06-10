import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from "class-validator";

export class CreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  postId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  text!: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}
