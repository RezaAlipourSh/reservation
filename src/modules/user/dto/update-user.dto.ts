import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsMobilePhone, IsString, Length } from "class-validator";
import { InvalidMessage } from "src/common/enums/message.enum";

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class ChangePhoneDto {
  @ApiProperty()
  @IsMobilePhone("fa-IR", {}, { message: InvalidMessage.InvalidPhoneFormat })
  phone: string;
}

export class ChangeEmailDto {
  @ApiProperty()
  @IsEmail({}, { message: InvalidMessage.InvalidEmailFormat })
  email: string;
}

export class ChangeUsernameDto {
  @ApiProperty()
  @IsString()
  @Length(5, 50)
  username: string;
}
