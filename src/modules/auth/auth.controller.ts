import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swaggerconsumes.enum";
import { AuthDto, CheckOtpDto } from "./dto/auth.dto";
import { Request, Response } from "express";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { AuthGuard } from "./guards/auth.guard";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("userExist")
  @ApiOperation({ summary: "login Or Register a new User" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  userExist(@Body() authDto: AuthDto, @Res() res: Response) {
    return this.authService.userExist(authDto, res);
  }

  @Post("check-otp")
  @ApiOperation({ summary: "Checking Otp Code" })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  checkOtp(@Body() checkOtpDto: CheckOtpDto) {
    return this.authService.checkOtp(checkOtpDto.code);
  }

  @Get("check-login")
  @ApiOperation({ summary: "check Login Status with Tokens" })
  @AuthDecorator()
  checkAuth(@Req() req: Request) {
    return req.user;
  }
}
