import { IsNotEmpty, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  @Min(10)
  text: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}
