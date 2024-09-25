import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { EventService } from "./event.service";
import { CreateEventDto, FilterEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { AuthDecorator } from "src/common/decorators/auth.decorator";
import { CanAccess } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";
import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swaggerconsumes.enum";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { filterEvent } from "src/common/decorators/filter.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";

@Controller("event")
@ApiTags("event")
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post("/create-event")
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @ApiOperation({ summary: "endpoint for creating new event by admins" })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get("upcoming-Events/:day")
  @ApiConsumes(SwaggerConsumes.UrlEncoded)
  @ApiOperation({ summary: "choose a day to returning upcoming events" })
  findUpcoming(@Param("day", ParseIntPipe) day: number) {
    return this.eventService.upcomingEvent(day);
  }

  @Get("/")
  @Pagination()
  @filterEvent()
  @ApiOperation({ summary: "list of All Events" })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterEventDto
  ) {
    return this.eventService.eventList(paginationDto, filterDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "update an Event by Admins" })
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  update(@Param("id") id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(+id, updateEventDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "remove an Event by Admins" })
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  remove(@Param("id") id: string) {
    return this.eventService.remove(+id);
  }
}
