import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBlockDto } from './create-block.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateBlockDto extends PartialType(CreateBlockDto) {
  @ApiProperty({
    example: true,
    description: 'Indicates if the block is active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
