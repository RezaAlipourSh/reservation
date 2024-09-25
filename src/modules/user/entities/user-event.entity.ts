import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enums";
import { EventEntity } from "src/modules/event/entities/event.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity(EntityName.UserEvent)
export class UserEventEntity extends BaseEntity {
  @Column()
  userId: number;
  @Column()
  eventId: number;
  @ManyToOne(() => EventEntity, (event) => event.users, { onDelete: "CASCADE" })
  event: EventEntity;
  @ManyToOne(() => UserEntity, (user) => user.events, { onDelete: "CASCADE" })
  user: UserEntity;
}
