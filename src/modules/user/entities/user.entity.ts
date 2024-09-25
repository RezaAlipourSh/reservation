import { Length } from "class-validator";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enums";
import { Roles } from "src/common/enums/role.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from "typeorm";
import { OtpEntity } from "./otp.entity";
import { EventEntity } from "src/modules/event/entities/event.entity";
import { UserEventEntity } from "./user-event.entity";

@Entity(EntityName.User)
export class UserEntity extends BaseEntity {
  @Column({ unique: true, nullable: true })
  username: string;
  @Column({ unique: true, nullable: true })
  email: string;
  @Column({ nullable: true })
  password: string;
  @Column({ unique: true, nullable: true })
  phone: string;
  @Column({ nullable: true })
  bio: string;
  @Column({ default: "user.png" })
  user_image: string;
  @Column({ default: Roles.User })
  role: string;
  @Column({ nullable: true })
  otpId: number;
  @Column({ nullable: true })
  new_email: string;
  @Column({ nullable: true })
  new_phone: string;
  @Column({ nullable: true, default: false })
  verify_email: boolean;
  @Column({ nullable: true, default: false })
  verify_phone: boolean;

  @OneToOne(() => OtpEntity, (otp) => otp.user, { nullable: true })
  @JoinColumn()
  otp: OtpEntity;
  @OneToMany(() => UserEventEntity, (event) => event.user)
  events: UserEventEntity[];
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
