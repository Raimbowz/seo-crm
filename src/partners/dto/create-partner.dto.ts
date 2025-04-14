import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreatePartnerDto {
  @ApiProperty({ example: 'Acme Inc.', description: 'Partner company name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'John Doe', description: 'Partner contact person' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  contactPerson: string;

  @ApiProperty({
    example: 'john@acme.com',
    description: 'Partner email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Partner phone number' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiProperty({
    example: 'https://www.acme.com',
    description: 'Partner website URL',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the partner is active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
