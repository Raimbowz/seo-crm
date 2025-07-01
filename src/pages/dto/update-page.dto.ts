import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePageDto } from './create-page.dto';
import { IsInt, IsString } from 'class-validator';
import { IsOptional } from 'class-validator';

export class UpdatePageDto extends PartialType(CreatePageDto) {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Template ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiProperty({
    example: 1,
    description: 'ID родительской страницы',
    required: false,
  })
  @IsOptional()
  @IsInt()
  parentId?: number;
}
