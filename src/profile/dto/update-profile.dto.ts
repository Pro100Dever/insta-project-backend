import { Type } from "class-transformer";
import { IsOptional, IsString, Length, ValidateNested } from "class-validator";

class UpdateProfileDataDto {
  @IsOptional()
  @IsString()
  photo!: string;

  @IsOptional()
  website!: string | null;

  @IsOptional()
  about!: string | null;
}

export class UpdateProfileDto {
  @IsOptional()
  @Length(4, 50)
  @IsString()
  username!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProfileDataDto)
  profile?: UpdateProfileDataDto;
}
