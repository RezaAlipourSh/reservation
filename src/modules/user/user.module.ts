import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { OtpEntity } from "./entities/otp.entity";
import { AuthModule } from "../auth/auth.module";
import { UserEventEntity } from "./entities/user-event.entity";
import { EventService } from "../event/event.service";
import { EventEmitter } from "stream";
import { EventEntity } from "../event/entities/event.entity";
import { EventCategoryEntity } from "../event/entities/event-category.entity";
import { CategoryService } from "../category/category.service";
import { CategoryEntity } from "../category/entities/category.entity";
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      UserEntity,
      OtpEntity,
      UserEventEntity,
      EventEntity,
      CategoryEntity,
      EventCategoryEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, EventService, CategoryService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
