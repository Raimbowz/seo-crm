import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsPhoneNumber, IsOptional, IsEnum } from 'class-validator';
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
  @IsPhoneNumber()
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
}
