import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfig } from "src/config/typeormConfig";
import { AuthModule } from "../auth/auth.module";
import { CategoryModule } from "../category/category.module";
import { EventModule } from "../event/event.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), ".env"),
    }),
    TypeOrmModule.forRoot(TypeOrmConfig()),
    AuthModule,
    UserModule,
    CategoryModule,
    EventModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
