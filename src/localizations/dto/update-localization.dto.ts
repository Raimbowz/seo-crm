import { PartialType } from '@nestjs/swagger';
import { CreateLocalizationDto } from './create-localization.dto';

export class UpdateLocalizationDto extends PartialType(CreateLocalizationDto) {}
