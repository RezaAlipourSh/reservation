import { Module } from "@nestjs/common";
import { EventService } from "./event.service";
import { EventController } from "./event.controller";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { EventEntity } from "./entities/event.entity";
import { CategoryService } from "../category/category.service";
import { CategoryEntity } from "../category/entities/category.entity";
import { EventCategoryEntity } from "./entities/event-category.entity";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      EventEntity,
      CategoryEntity,
      EventCategoryEntity,
    ]),
  ],
  controllers: [EventController],
  providers: [EventService, CategoryService],
})
export class EventModule {}
