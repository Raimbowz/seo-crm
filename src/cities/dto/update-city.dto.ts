import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCityDto {
  @ApiProperty({
    example: 'Москва',
    description: 'City name (nominative case)',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Москвы',
    description: 'City name in genitive case',
    required: false,
  })
  @IsString()
  @IsOptional()
  nameGenitive?: string;

  @ApiProperty({
    example: 'Москве',
    description: 'City name in dative case',
    required: false,
  })
  @IsString()
  @IsOptional()
  nameDative?: string;

  @ApiProperty({
    example: 'Москву',
    description: 'City name in accusative case',
    required: false,
  })
  @IsString()
  @IsOptional()
  nameAccusative?: string;

  @ApiProperty({
    example: 'Москвой',
    description: 'City name in instrumental case',
    required: false,
  })
  @IsString()
  @IsOptional()
  nameInstrumental?: string;

  @ApiProperty({
    example: 'Москве',
    description: 'City name in prepositional case',
    required: false,
  })
  @IsString()
  @IsOptional()
  namePrepositional?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the city is active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether the city is main',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isMain?: boolean;
}
