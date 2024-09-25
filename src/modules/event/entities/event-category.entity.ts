import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enums";
import { Column, Entity, ManyToOne } from "typeorm";
import { EventEntity } from "./event.entity";
import { CategoryEntity } from "src/modules/category/entities/category.entity";

@Entity(EntityName.EventCategory)
export class EventCategoryEntity extends BaseEntity {
  @Column()
  eventId: number;
  @Column()
  categoryId: number;
  @ManyToOne(() => EventEntity, (event) => event.categories)
  event: EventEntity;
  @ManyToOne(() => CategoryEntity, (category) => category.event_categories)
  category: CategoryEntity;
}
