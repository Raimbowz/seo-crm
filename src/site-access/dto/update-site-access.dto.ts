import { PartialType } from '@nestjs/swagger';
import { CreateSiteAccessDto } from './create-site-access.dto';

export class UpdateSiteAccessDto extends PartialType(CreateSiteAccessDto) {}
