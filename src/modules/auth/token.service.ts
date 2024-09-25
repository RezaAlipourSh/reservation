import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  AccessTokenPayLoad,
  CookiePayLoad,
  EmailTokenPayLoad,
  PhoneTokenPayLoad,
} from "./types/payload";
import { AuthMessage, BadRequestMessage } from "src/common/enums/message.enum";

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  createOtpToken(payload: CookiePayLoad) {
    const token = this.jwtService.sign(payload, {
      secret: process.env.OTP_TOKEN_SECRET,
      expiresIn: 60 * 2,
    });
    return token;
  }

  verifyOtpToken(token: string): CookiePayLoad {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.OTP_TOKEN_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException(AuthMessage.TryAgain);
    }
  }

  createAccessToken(payload: AccessTokenPayLoad) {
    const token = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: "1y",
    });

    return token;
  }

  verifyAccessToken(token: string): AccessTokenPayLoad {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException(AuthMessage.LoginAgain);
    }
  }

  createEmailToken(payload: EmailTokenPayLoad) {
    const token = this.jwtService.sign(payload, {
      secret: process.env.EMAIL_TOKEN_SECRET,
      expiresIn: 60 * 2,
    });

    return token;
  }

  verifyEmailToken(token: string): EmailTokenPayLoad {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.EMAIL_TOKEN_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException(BadRequestMessage.SomeError);
    }
  }

  createPhoneToken(payload: PhoneTokenPayLoad) {
    const token = this.jwtService.sign(payload, {
      secret: process.env.PHONE_TOKEN_SECRET,
      expiresIn: 60 * 2,
    });

    return token;
  }

  verifyPhoneToken(token: string): PhoneTokenPayLoad {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.PHONE_TOKEN_SECRET,
      });
    } catch (error) {
      throw new BadRequestException(BadRequestMessage.SomeError);
    }
  }
}
