import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';

@ApiExtraModels()
export class CreateVariableDto {
  @ApiProperty({
    example: 'PAGE_TITLE',
    description: 'Ключ переменной. Используется как {{KEY}} в шаблоне.',
    type: String,
    minLength: 1,
    maxLength: 64,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    example: 'Главная страница',
    description:
      'Значение переменной, которое будет подставлено вместо {{KEY}}.',
    type: String,
    minLength: 1,
    maxLength: 1024,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    example: 'Название переменной',
    description: 'Название переменной',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Комментарий к переменной',
    description: 'Комментарий к переменной',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({
    example: true,
    description: 'Активна ли переменная. Только активные участвуют в парсинге.',
    type: Boolean,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: false,
    description:
      'Является ли переменная системной. Системные переменные нельзя удалить.',
    type: Boolean,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @ApiProperty({
    example: 1,
    description: 'Идентификатор сайта',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  siteId?: number;
}
