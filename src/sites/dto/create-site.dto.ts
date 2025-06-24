import { ApiProperty } from '@nestjs/swagger';
  import { IsOptional, IsString, IsNotEmpty, IsUrl, IsNumber, IsBoolean, IsJSON, MinLength, MaxLength, Matches } from 'class-validator';
export class CreateSiteDto {
  @ApiProperty({ example: 'My Site', description: 'Site name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'https://mysite.com', description: 'Site URL' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ApiProperty({ example: 'mysite.com', description: 'Domain' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  domain: string;


  @ApiProperty({ example: true, description: 'Robots meta no index', required: false })
  @IsOptional()
  @IsBoolean()
  robotsMetaNoIndex?: boolean;

  @ApiProperty({ example: 'Описание сайта', description: 'Site description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'https://mysite.com/favicon.ico', description: 'Favicon URL', required: false })
  @IsOptional()
  @IsString()
  favicon?: string;

  @ApiProperty({ example: 'https://mysite.com/logo.png', description: 'Logo URL', required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ example: 'light', description: 'Theme name', required: false })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiProperty({ example: 'Inter', description: 'Google Font family name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  googleFont?: string;

  @ApiProperty({ example: 'User agent: *', description: 'robots.txt content', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  robotsTxt?: string;

  @ApiProperty({ example: '{"title":"My Site","description":"SEO desc"}', description: 'Meta tags (JSON)', required: false })
  @IsOptional()
  @IsJSON()
  meta?: JSON;

  @ApiProperty({ example: 1, description: 'Owner user ID' })
  @IsNumber()
  ownerId: number;

  @ApiProperty({ example: true, description: 'Whether the site is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: '{"ru":{"metaTitle":"My Site","metaDescription":"SEO desc"}}', description: 'Locales', required: false })
  @IsOptional()
  @IsJSON()
  locales?: JSON;

  @ApiProperty({ example: 'site', description: 'Type of site', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: true, description: 'Whether localizations are enabled', required: false })
  @IsOptional()
  @IsBoolean()
  localizationsEnabled?: boolean;

  @ApiProperty({ example: 'ru-RU', description: 'Default locale when localizations disabled', required: false })
  @IsOptional()
  @IsString()
  defaultLocale?: string;

  @ApiProperty({ example: 'Global title', description: 'Global meta title when localizations disabled', required: false })
  @IsOptional()
  @IsString()
  globalMetaTitle?: string;

  @ApiProperty({ example: 'Global description', description: 'Global meta description when localizations disabled', required: false })
  @IsOptional()
  @IsString()
  globalMetaDescription?: string;
} 