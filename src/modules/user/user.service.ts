import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Scope,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { ChangePhoneDto, UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { Repository } from "typeorm";
import { OtpEntity } from "./entities/otp.entity";
import { AuthService } from "../auth/auth.service";
import { TokenService } from "../auth/token.service";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import {
  AuthMessage,
  BadRequestMessage,
  ConflictMessage,
  EventMessage,
  EventPrice,
  NotFoundMessage,
  PublicMessage,
} from "src/common/enums/message.enum";
import { AuthMethod } from "../auth/enums/method.enum";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { UserEventEntity } from "./entities/user-event.entity";
import { EventService } from "../event/event.service";

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(OtpEntity) private otpRepo: Repository<OtpEntity>,
    @InjectRepository(UserEventEntity)
    private userEventRepo: Repository<UserEventEntity>,
    @Inject(REQUEST) private request: Request,
    private eventService: EventService,
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  findAll() {
    return this.userRepo.find({
      where: {},
    });
  }

  async reserveTicket(eventId: number) {
    const { id } = this.request.user;
    const event = await this.eventService.checkExistEventById(eventId);
    await this.eventService.checkEventDate(eventId);
    await this.eventService.decreaseLimit(eventId);
    await this.userEventRepo.insert({
      userId: id,
      eventId,
    });

    return {
      message: EventMessage.EventReserved,
      price: EventPrice(event.price),
    };
  }

  async changePhone(phone: string) {
    const { id } = this.request.user;
    const user = await this.userRepo.findOneBy({ phone });
    if (user && user?.id !== id) {
      throw new ConflictException(ConflictMessage.Phone);
    } else if (user && user.id == id) {
      return {
        message: PublicMessage.Updated,
      };
    }

    await this.userRepo.update({ id }, { new_phone: phone });
    const otp = await this.authService.SaveOtp(id, AuthMethod.Phone);
    const token = this.tokenService.createPhoneToken({ phone });
    return {
      code: otp.code,
      token,
    };
  }

  async verifyPhone(code: string) {
    const { id: userId, new_phone } = this.request.user;
    const token = this.request.cookies?.[CookieKeys.PhoneOtp];
    if (!token) throw new BadRequestException(AuthMessage.ExpiredCode);
    const { phone } = this.tokenService.verifyPhoneToken(token);
    if (phone !== new_phone)
      throw new BadRequestException(BadRequestMessage.SomeError);
    const otp = await this.checkOtp(userId, code);
    if (otp.method !== AuthMethod.Phone)
      throw new BadRequestException(BadRequestMessage.SomeError);
    await this.userRepo.update(
      { id: userId },
      {
        phone,
        verify_phone: true,
        new_phone: null,
      }
    );

    return {
      message: PublicMessage.Updated,
    };
  }

  async changeEmail(email: string) {
    const { id } = this.request.user;
    const user = await this.userRepo.findOneBy({ email });
    if (user && user?.id !== id) {
      throw new ConflictException(ConflictMessage.Email);
    } else if (user && user.id == id) {
      return {
        message: PublicMessage.Updated,
      };
    }
    await this.userRepo.update({ id }, { new_email: email });
    const otp = await this.authService.SaveOtp(id, AuthMethod.Email);
    const token = this.tokenService.createEmailToken({ email });
    return {
      code: otp.code,
      token,
    };
  }

  async verifyEmail(code: string) {
    const { id: userId, new_email } = this.request.user;
    const token = this.request.cookies?.[CookieKeys.EmailOtp];
    if (!token) throw new BadRequestException(AuthMessage.ExpiredCode);
    const { email } = this.tokenService.verifyEmailToken(token);
    if (email !== new_email)
      throw new BadRequestException(BadRequestMessage.SomeError);
    const otp = await this.checkOtp(userId, code);
    if (otp.method !== AuthMethod.Email)
      throw new BadRequestException(BadRequestMessage.SomeError);
    await this.userRepo.update(
      { id: userId },
      {
        email,
        verify_email: true,
        new_email: null,
      }
    );

    return {
      message: PublicMessage.Updated,
    };
  }

  async changeUsername(username: string) {
    const { id } = this.request.user;
    const user = await this.userRepo.findOneBy({ username });
    if (user && user?.id !== id) {
      throw new ConflictException(ConflictMessage.Username);
    } else if (user && user.id == id) {
      // return {
      //   message: PublicMessage.Updated,
      // };
      await this.userRepo.update({ id }, { username });
      return {
        message: PublicMessage.Updated,
      };
    }
  }

  async checkOtp(userId: number, code: string) {
    const otp = await this.otpRepo.findOneBy({ userId });
    if (!otp) throw new BadRequestException(NotFoundMessage.NotFound);
    const now = new Date();
    if (otp.expiresIn < now)
      throw new BadRequestException(AuthMessage.ExpiredCode);
    if (otp.code !== code) throw new BadRequestException(AuthMessage.TryAgain);

    return otp;
  }
}
