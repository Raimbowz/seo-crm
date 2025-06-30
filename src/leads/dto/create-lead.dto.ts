import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsPhoneNumber, IsOptional, IsEnum, IsIP, IsNumber } from 'class-validator';
import { LeadStatus } from '../entities/lead.entity';

export class CreateLeadDto {
  @ApiProperty({ description: 'First name of the lead' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name of the lead' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Email address of the lead' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Phone number of the lead' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Company name', required: false })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({ description: 'Lead source', required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({
    description: 'Lead status',
    required: false,
    enum: LeadStatus,
    default: LeadStatus.NEW
  })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiProperty({ description: 'Notes about the lead', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'IP address', required: false })
  @IsIP()
  @IsOptional()
  ip?: string;

  @ApiProperty({ description: 'Country code', required: false })
  @IsString()
  @IsOptional()
  countryCode?: string;

  @ApiProperty({ description: 'User agent', required: false })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiProperty({ description: 'Locale', required: false })
  @IsString()
  @IsOptional()
  locale?: string;

  @ApiProperty({ description: 'Referer URL', required: false })
  @IsString()
  @IsOptional()
  referer?: string;

  @ApiProperty({ description: 'Site ID', required: false })
  @IsNumber()
  @IsOptional()
  siteId?: number;

  @ApiProperty({ description: 'Domain name', required: false })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiProperty({ description: 'Additional form data', required: false })
  @IsOptional()
  formData?: any;
}
