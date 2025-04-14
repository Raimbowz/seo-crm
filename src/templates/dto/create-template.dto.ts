import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({ description: 'The name of the template' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The description of the template' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'The content of the template' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The type of the template' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Whether the template is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 