import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsObject } from 'class-validator';
export class CreateSiteAccessDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: 1, description: 'Site ID' })
  @IsNumber()
  @IsNotEmpty()
  siteId: number;

  @ApiProperty({
    example: '{"edit":true,"view":true}',
    description: 'Permissions (JSON)',
    required: false,
  })
  @IsObject()
  @IsNotEmpty()
  permissions?: any;
}
