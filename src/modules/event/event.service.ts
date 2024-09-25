import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { CreateEventDto, FilterEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { EventEntity } from "./entities/event.entity";
import { And, LessThan, MoreThan, Repository } from "typeorm";
import { CategoryService } from "../category/category.service";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { EventCategoryEntity } from "./entities/event-category.entity";
import { isArray } from "class-validator";
import {
  BadRequestMessage,
  EventMessage,
  NotFoundMessage,
  PublicMessage,
} from "src/common/enums/message.enum";
import { createSlug, randomId } from "src/common/utils/functions.utils";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utils/pagination.util";
import { EntityName } from "src/common/enums/entity.enums";

@Injectable({ scope: Scope.REQUEST })
export class EventService {
  constructor(
    @InjectRepository(EventEntity) private eventRepo: Repository<EventEntity>,
    @InjectRepository(EventCategoryEntity)
    private eventCategoryRepo: Repository<EventCategoryEntity>,
    private categoryService: CategoryService,
    @Inject(REQUEST) private request: Request
  ) {}

  async create(eventDto: CreateEventDto) {
    let { title, fan_limit, price, date, description, slug, categories } =
      eventDto;
    if (!isArray(categories) && typeof categories === "string") {
      categories = categories.split(",");
    } else if (!isArray(categories)) {
      throw new BadRequestException(BadRequestMessage.InvalidCategory);
    }

    let slugData = slug ?? title;
    slug = createSlug(slugData);
    const isExist = await this.checkEventBySlug(slug);
    if (isExist) {
      slug += `-${randomId()}`;
    }

    let event = this.eventRepo.create({
      title,
      slug,
      description,
      date,
      price,
      fan_limit,
    });

    event = await this.eventRepo.save(event);
    for (const categorytitle of categories) {
      let category = await this.categoryService.findOneByTitle(categorytitle);
      if (!category) {
        category = await this.categoryService.insertByTitle(categorytitle);
      }
      await this.eventCategoryRepo.insert({
        eventId: event.id,
        categoryId: category.id,
      });
    }
    return {
      message: PublicMessage.Created,
    };
  }

  async eventList(paginationDto: PaginationDto, filterDto: FilterEventDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    let { category, search } = filterDto;
    let where = "";
    if (category) {
      category = category.toLowerCase();
      if (where.length > 0) where += " AND ";
      where += "category.title = LOWER(:category)";
    }
    if (search) {
      if (where.length > 0) where += " AND ";
      search = `%${search}%`;
      where += "CONCAT(event.title, event.description) ILIKE :search";
    }

    const [events, count] = await this.eventRepo
      .createQueryBuilder(EntityName.Event)
      .leftJoin("event.categories", "categories")
      .leftJoin("categories.category", "category")
      .addSelect(["categories.id", "category.title"])
      .where(where, { category, search })
      .orderBy("event.id", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      pagination: paginationGenerator(count, page, limit),
      events,
    };
  }

  async upcomingEvent(day: number) {
    const now = new Date();
    let untilDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
    const events = await this.eventRepo.find({
      where: {
        date: And(LessThan(untilDate), MoreThan(now)),
      },

      order: {
        date: "DESC",
      },
    });
    console.log(events);

    if (!events)
      throw new NotFoundException(NotFoundMessage.NotFoundUpcomingEvent);

    return {
      events,
    };
  }

  async checkEventBySlug(slug: string) {
    const blog = await this.eventRepo.findOneBy({ slug });
    return blog;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    let { title, date, description, price, fan_limit, slug, categories } =
      updateEventDto;
    const event = await this.checkExistEventById(id);
    if (!isArray(categories) && typeof categories === "string") {
      categories = categories.split(",");
    } else if (!isArray) {
      throw new BadRequestException(BadRequestMessage.InvalidCategory);
    }

    let slugData = null;
    if (title) {
      slugData = title;
      event.title = title;
    }
    if (slug) slugData = slug;
    if (slugData) {
      slug = createSlug(slugData);
      const isExistSlug = await this.checkEventBySlug(slug);
      if (isExistSlug && isExistSlug.id !== id) {
        slug += `-${randomId()}`;
      }
      event.slug = slug;
    }

    if (description) event.description = description;
    if (date) event.date = date;
    if (fan_limit) event.fan_limit = fan_limit;
    if (price) event.price = price;

    await this.eventRepo.save(event);

    if (categories && isArray(categories) && categories.length > 0) {
      await this.eventCategoryRepo.delete({ eventId: event.id });
    }

    for (const categoryTitle of categories) {
      let category = await this.categoryService.findOneByTitle(categoryTitle);
      if (!category) {
        category = await this.categoryService.insertByTitle(categoryTitle);
      }
      await this.eventCategoryRepo.insert({
        eventId: event.id,
        categoryId: category.id,
      });
    }

    return {
      message: PublicMessage.Updated,
    };
  }

  async decreaseLimit(id: number) {
    const event = await this.checkExistEventById(id);
    if (event.fan_limit >= 1) {
      await this.eventRepo
        .createQueryBuilder()
        .update()
        .set({ fan_limit: () => "fan_limit - 1" })
        .where("id = :id", { id })
        .execute();
    } else {
      throw new BadRequestException(EventMessage.FanLimitMessage);
    }
  }

  async checkEventDate(id: number) {
    const now = Date.now();
    const event = await this.eventRepo.findOneBy({ id });
    if (event.date.getTime() < now)
      throw new NotFoundException(EventMessage.EventFinished);
  }

  async checkExistEventById(id: number) {
    const event = await this.eventRepo.findOneBy({ id });
    if (!event) throw new NotFoundException(NotFoundMessage.NotFoundEvent);
    return event;
  }

  async remove(id: number) {
    await this.checkExistEventById(id);
    await this.eventRepo.delete({ id });
    return {
      message: PublicMessage.Deleted,
    };
  }
}
