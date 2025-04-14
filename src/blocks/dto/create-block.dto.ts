import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateBlockDto {
  @ApiProperty({ description: 'The name of the block' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The content of the block' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The type of the block' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Whether the block is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
