import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enums";
import { EventCategoryEntity } from "src/modules/event/entities/event-category.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity(EntityName.Category)
export class CategoryEntity extends BaseEntity {
  @Column()
  title: string;
  @OneToMany(() => EventCategoryEntity, (event) => event.category)
  event_categories: EventCategoryEntity[];
}
