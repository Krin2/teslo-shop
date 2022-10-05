import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    description: 'Quantity of items to be shown',
  })
  @IsOptional()
  @IsPositive()
  // transformar dato a number porque viene como string
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    default: 0,
    description: 'Quantity of items to be skiped',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  // transformar dato a number porque viene como string
  @Type(() => Number)
  offset?: number;
}
