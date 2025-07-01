import { PartialType, ApiExtraModels } from '@nestjs/swagger';
import { CreateImageDto } from './create-image.dto';

@ApiExtraModels(CreateImageDto)
export class UpdateImageDto extends PartialType(CreateImageDto) {}
