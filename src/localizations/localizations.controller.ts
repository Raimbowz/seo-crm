import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { LocalizationsService } from './localizations.service';
import { Localization } from './entities/localization.entity';

@Controller('localizations')
export class LocalizationsController {
  constructor(private readonly localizationsService: LocalizationsService) {}

  @Post()
  create(@Body() data: Partial<Localization>) {
    return this.localizationsService.create(data);
  }

  @Get()
  findAll() {
    return this.localizationsService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: Partial<Localization>) {
    return this.localizationsService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.localizationsService.remove(Number(id));
  }
}
