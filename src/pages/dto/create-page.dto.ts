import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  isUUID,
  MaxLength,
} from 'class-validator';

export class CreatePageDto {
  @ApiProperty({ example: 'Home Page', description: 'Page title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'home-page', description: 'SEO-friendly URL slug' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;

  @ApiProperty({
    example: 'Welcome to our website',
    description: 'Page meta description',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaDescription?: string;

  @ApiProperty({
    example: 'home, page, website',
    description: 'Page meta keywords',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaKeywords?: string;

  @ApiProperty({ example: 1, description: 'City ID' })
  @IsInt()
  @IsOptional()
  cityId: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Template ID' })
  @IsUUID()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({ example: 1, description: 'Site ID' })
  @IsNotEmpty()
  siteId: number;

  @ApiProperty({
    example: 1,
    description: 'Partner ID',
    required: false,
  })
  @IsInt()
  @IsOptional()
  partnerId?: number;

  @ApiProperty({
    example: true,
    description: 'Whether the page is active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: true, description: 'Whether the page is main', required: false })
  @IsBoolean()
  @IsOptional()
  isMain?: boolean;

  @ApiProperty({ example: 1, description: 'ID родительской страницы', required: false })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiProperty({ example: true, description: 'Whether the page is global', required: false })
  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean;
}
