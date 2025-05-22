import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBlockDto } from './create-block.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateBlockDto extends PartialType(CreateBlockDto) {}
