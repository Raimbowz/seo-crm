import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
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
  @IsNotEmpty()
  cityId: number;

  @ApiProperty({ example: 1, description: 'Template ID' })
  @IsInt()
  @IsNotEmpty()
  templateId: number;

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
}
