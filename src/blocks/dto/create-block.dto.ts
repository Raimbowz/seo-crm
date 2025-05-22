import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsJSON, IsNumber } from 'class-validator';

export class CreateBlockDto {
  @ApiProperty({ description: 'The name of the block' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The content of the block' })
  @IsJSON()
  @IsNotEmpty()
  content: JSON;

  @ApiProperty({ description: 'The type of the block' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Whether the block is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Whether the block is global', required: false })
  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean;

  @ApiProperty({ description: 'The site id of the block', required: false })
  @IsNumber()
  @IsOptional()
  siteId?: number;
}
