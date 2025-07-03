import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsUrl,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CloneSiteDto {
  @ApiProperty({ example: 'My Site Copy', description: 'New site name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'https://mysite-copy.com', description: 'New site URL' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ApiProperty({ example: 'mysite-copy.com', description: 'New domain' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/)
  domain: string;

  @ApiProperty({
    example: 'Копия сайта',
    description: 'New site description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Copy global blocks',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  copyGlobalBlocks?: boolean;

  @ApiProperty({
    example: true,
    description: 'Copy site variables',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  copyVariables?: boolean;

  @ApiProperty({
    example: true,
    description: 'Copy non-global images',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  copyImages?: boolean;
}