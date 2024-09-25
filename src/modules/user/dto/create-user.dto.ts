import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {}

export class ReserveDto {
  @ApiProperty()
  eventId: number;
}
