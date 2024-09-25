import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, ReserveDto } from "./dto/create-user.dto";
import {
  ChangeEmailDto,
  ChangePhoneDto,
  ChangeUsernameDto,
  UpdateUserDto,
} from "./dto/update-user.dto";
import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swaggerconsumes.enum";
import { Response } from "express";
import { CookiesOptionsToken } from "src/common/utils/cookie.util";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { PublicMessage } from "src/common/enums/message.enum";
import { CheckOtpDto } from "../auth/dto/auth.dto";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";

@Controller("user")
@ApiTags("User")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/list")
  @ApiOperation({ summary: "getting list of users Just For Admins" })
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  findAll() {
    return this.userService.findAll();
  }

  @Post("/reserve")
  @ApiOperation({
    summary: "کاربر لاگین شده با استفاده از ایدی رویداد بلیط خود را رزرو میکند",
  })
  @AuthDecorator()
  @ApiConsumes(SwaggerConsumes.UrlEncoded)
  async reserve(@Body() reserveDto: ReserveDto) {
    return this.userService.reserveTicket(reserveDto.eventId);
  }

  @Patch("/change-email")
  @AuthDecorator()
  @ApiOperation({
    summary: "تغییر ایمیل کاربری",
  })
  @ApiConsumes(SwaggerConsumes.UrlEncoded)
  async changeEmail(@Body() emailDto: ChangeEmailDto, @Res() res: Response) {
    const { code, token, message } = await this.userService.changeEmail(
      emailDto.email
    );
    if (message) return res.json({ message });
    res.cookie(CookieKeys.EmailOtp, token, CookiesOptionsToken());
    res.json({
      code,
      message: PublicMessage.Sentotp,
    });
  }

  @Post("/verify-email-otp")
  @AuthDecorator()
  @ApiOperation({
    summary: "بررسی کد یکبار مصرف برای ایمیل کاربری",
  })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyEmail(@Body() otpDto: CheckOtpDto) {
    return this.userService.verifyEmail(otpDto.code);
  }

  @Patch("/change-phone")
  @AuthDecorator()
  @ApiOperation({
    summary: "تغییر شماره موبایل کاربر",
  })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changePhone(@Body() phoneDto: ChangePhoneDto, @Res() res: Response) {
    const { code, token, message } = await this.userService.changePhone(
      phoneDto.phone
    );
    if (message) return res.json({ message });
    res.cookie(CookieKeys.PhoneOtp, token, CookiesOptionsToken());
    res.json({
      code,
      message: PublicMessage.Sentotp,
    });
  }

  @Post("/verify-phone-otp")
  @AuthDecorator()
  @ApiOperation({
    summary: "بررسی کد یکبار مصرف موبایل",
  })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyPhone(@Body() otpDto: CheckOtpDto) {
    return this.userService.verifyPhone(otpDto.code);
  }

  @Patch("/change-username")
  @AuthDecorator()
  @ApiOperation({
    summary: "تغییر نام کاربری",
  })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeusername(@Body() usernameDto: ChangeUsernameDto) {
    return this.userService.changeUsername(usernameDto.username);
  }
}
