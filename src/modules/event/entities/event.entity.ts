import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enums";
import { CategoryEntity } from "src/modules/category/entities/category.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { EventCategoryEntity } from "./event-category.entity";
import { UserEventEntity } from "src/modules/user/entities/user-event.entity";

@Entity(EntityName.Event)
export class EventEntity extends BaseEntity {
  @Column()
  title: string;
  @Column({ nullable: true })
  description: string;
  @Column({ unique: true })
  slug: string;
  @Column()
  date: Date;
  @Column({ default: 100 })
  fan_limit: number;
  @Column({ nullable: true })
  price: number;
  @OneToMany(() => EventCategoryEntity, (category) => category.event)
  categories: EventCategoryEntity[];
  @OneToMany(() => UserEventEntity, (user) => user.event)
  users: UserEventEntity[];
}
