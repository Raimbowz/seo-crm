import { ApiProperty, ApiExtraModels, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { CreateVariableDto } from './create-variable.dto';

@ApiExtraModels()
export class UpdateVariableDto extends PartialType(CreateVariableDto) {}
