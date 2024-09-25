import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, Length } from "class-validator";

export class CreateEventDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 50)
  title: string;
  @ApiPropertyOptional()
  slug: string;
  @ApiPropertyOptional()
  description: string;
  @ApiProperty({})
  // @IsDate()
  date: Date;
  @ApiPropertyOptional({ default: 100 })
  fan_limit: number;
  @ApiPropertyOptional()
  price: number;
  @ApiProperty({ type: String, isArray: true })
  categories: string[] | string;
}

export class FilterEventDto {
  category: string;
  search: string;
}
