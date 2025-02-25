import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import { AuthMethod } from "./enums/method.enum";
import { isEmail, isMobilePhone } from "class-validator";
import {
  AuthMessage,
  BadRequestMessage,
  PublicMessage,
} from "src/common/enums/message.enum";
import { UserEntity } from "../user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomInt } from "crypto";
import { OtpEntity } from "../user/entities/otp.entity";
import { TokenService } from "./token.service";
import { REQUEST } from "@nestjs/core";
import { Request, Response } from "express";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { AuthResponse } from "./types/response";
import { CookiesOptionsToken } from "src/common/utils/cookie.util";
import { AuthType } from "./enums/type.enum";

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
    private tokenService: TokenService,
    @Inject(REQUEST) private request: Request
  ) {}

  async userExist(authDto: AuthDto, res: Response) {
    const { method, type, username } = authDto;
    let result: AuthResponse;
    switch (type) {
      case AuthType.Login:
        result = await this.login(method, username);
        return this.sendResponse(res, result);
      case AuthType.Register:
        result = await this.register(method, username);
        return this.sendResponse(res, result);

      default:
        throw new UnauthorizedException();
    }
  }

  async sendResponse(res: Response, result: AuthResponse) {
    const { token, code } = result;

    res.cookie(CookieKeys.Otp, token, CookiesOptionsToken());

    res.json({
      message: PublicMessage.Sentotp,
      code,
    });
  }

  async login(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);
    let user: UserEntity = await this.checkUserExist(method, validUsername);
    if (!user) throw new UnauthorizedException(AuthMessage.NotFoundAccount);
    const otp = await this.SaveOtp(user.id, method);
    const token = this.tokenService.createOtpToken({ userId: user.id });

    return {
      token,
      code: otp.code,
      method,
    };
  }

  async register(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);
    let user: UserEntity = await this.checkUserExist(method, validUsername);
    if (user) throw new ConflictException(AuthMessage.AlreadyExistAccount);
    if (method === AuthMethod.Username) {
      throw new BadRequestException(BadRequestMessage.InValidLoginData);
    }

    user = this.userRepository.create({
      [method]: username,
    });
    user = await this.userRepository.save(user);
    user.username = `m_${user.id}`;
    await this.userRepository.save(user);

    const otp = await this.SaveOtp(user.id, method);
    const token = this.tokenService.createOtpToken({ userId: user.id });

    return {
      token,
      code: otp.code,
    };
  }

  async SaveOtp(userId: number, method: AuthMethod) {
    const code = randomInt(10000, 99999).toString();
    const expiresIn = new Date(Date.now() + 1000 * 60 * 2);
    let otp = await this.otpRepository.findOneBy({ userId });
    let existOtp = false;
    if (otp) {
      (existOtp = true),
        (otp.code = code),
        (otp.expiresIn = expiresIn),
        (otp.method = method);
    } else {
      otp = this.otpRepository.create({
        code,
        expiresIn,
        method,
        userId,
      });
    }

    otp = await this.otpRepository.save(otp);
    if (!existOtp) {
      await this.userRepository.update(
        { id: userId },
        {
          otpId: otp.id,
        }
      );
    }

    return otp;
  }

  async checkOtp(code: string) {
    const token = await this.request.cookies?.[CookieKeys.Otp];
    if (!token) throw new UnauthorizedException(AuthMessage.ExpiredCode);
    const { userId } = this.tokenService.verifyOtpToken(token);
    const otp = await this.otpRepository.findOneBy({ userId });
    console.log(otp, otp.expiresIn, otp.code);
    if (!otp) throw new UnauthorizedException(AuthMessage.LoginAgain);
    const now = new Date();
    if (otp.expiresIn < now)
      throw new UnauthorizedException(AuthMessage.ExpiredCode);
    if (otp.code !== code)
      throw new UnauthorizedException(AuthMessage.TryAgain);
    const accesstoken = this.tokenService.createAccessToken({ userId });
    console.log(accesstoken);
    if (otp.method === AuthMethod.Email) {
      await this.userRepository.update({ id: userId }, { verify_email: true });
    } else if (otp.method === AuthMethod.Phone) {
      await this.userRepository.update(
        { id: userId },
        {
          verify_phone: true,
        }
      );
    }

    return {
      message: PublicMessage.LoggedIn,
      accesstoken,
    };
  }

  async validateAccessToken(token: string) {
    const { userId } = this.tokenService.verifyAccessToken(token);
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException(AuthMessage.LoginAgain);
    return user;
  }
  usernameValidator(method: AuthMethod, username: string) {
    switch (method) {
      case AuthMethod.Email:
        if (isEmail(username)) return username;
        throw new BadRequestException(AuthMessage.IncorrectEmail);
      case AuthMethod.Phone:
        if (isMobilePhone(username, "fa-IR")) return username;
        throw new BadRequestException(" bad mobile phone format");
      case AuthMethod.Username:
        return username;
      default:
        throw new UnauthorizedException(AuthMessage.InvalidUsername);
    }
  }

  async checkUserExist(method: AuthMethod, username: string) {
    let user: UserEntity;
    if (method === AuthMethod.Phone) {
      user = await this.userRepository.findOneBy({ phone: username });
    } else if (method === AuthMethod.Email) {
      user = await this.userRepository.findOneBy({ email: username });
    } else if (method === AuthMethod.Username) {
      user = await this.userRepository.findOneBy({ username: username });
    } else {
      throw new BadRequestException(BadRequestMessage.InValidLoginData);
    }

    return user;
  }
}
