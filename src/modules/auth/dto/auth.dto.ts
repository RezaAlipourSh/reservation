import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, Length } from "class-validator";
import { AuthType } from "../enums/type.enum";
import { AuthMethod } from "../enums/method.enum";

export class AuthDto {
  @ApiProperty()
  @IsString()
  @Length(5, 70)
  username: string;
  @ApiProperty({ enum: AuthType })
  @IsEnum(AuthType)
  type: string;
  @ApiProperty({ enum: AuthMethod })
  @IsEnum(AuthMethod)
  method: AuthMethod;
}

export class CheckOtpDto {
  @ApiProperty()
  @IsString()
  @Length(5, 5)
  code: string;
}
