import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  IsJSON,
  IsNumber,
} from 'class-validator';

export class CreatePartnerDto {
  @ApiProperty({ example: 'Acme Inc.', description: 'Partner company name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Lead provider for trading platform',
    description: 'Partner description',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

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
    example: 'https://api.partner.com/leads',
    description: 'API endpoint URL for lead submission',
  })
  apiUrl: string;

  @ApiProperty({ example: 'POST', description: 'HTTP method for API requests' })
  @IsString()
  @IsIn(['GET', 'POST', 'PUT', 'PATCH'])
  @IsOptional()
  apiMethod?: string;

  @ApiProperty({
    example:
      '{"Authorization": "Bearer token123", "Content-Type": "application/json"}',
    description: 'Additional headers for API requests (JSON format)',
  })
  @IsJSON()
  @IsOptional()
  apiHeaders?: string;

  @ApiProperty({
    example:
      '{"firstName": "fname", "lastName": "lname", "email": "email", "phone": "profile[phone]"}',
    description: 'Field mapping from lead to partner API (JSON format)',
  })
  @IsJSON()
  @IsNotEmpty()
  fieldMapping: string;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'Array of site IDs to connect to this partner',
    required: false,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  siteIds?: number[];

  @ApiProperty({
    example: true,
    description: 'Whether the partner is active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: 300,
    description: 'Delay in seconds before sending lead to partner (0 = immediate)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  delaySeconds?: number;
}
