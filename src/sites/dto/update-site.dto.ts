import { PartialType } from '@nestjs/swagger';
import { CreateSiteDto } from './create-site.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateSiteDto extends PartialType(CreateSiteDto) {
  @ApiProperty({ example: 1, description: 'Site ID' })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
