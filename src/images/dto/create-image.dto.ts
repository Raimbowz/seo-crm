import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({ example: 'cat.jpg', description: 'Название изображения' })
  @IsString()
  name: string;

  @ApiProperty({
    example: '/images/static/cat.jpg',
    description: 'Ссылка на файл (относительный путь или url)',
  })
  @IsString()
  link: string;

  @ApiProperty({
    required: false,
    example: 'cats',
    description: 'Группа изображений',
  })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiProperty({ example: 1, description: 'ID пользователя-владельца' })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ example: 1, description: 'ID сайта', required: false })
  @IsOptional()
  @IsNumber()
  siteId?: number;

  @ApiProperty({
    default: false,
    example: true,
    description: 'Глобальное изображение (доступно для всех сайтов)',
  })
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @ApiProperty({
    default: false,
    example: true,
    description: 'Публично ли изображение',
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    default: true,
    example: true,
    description: 'Активно ли изображение',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
