import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Localization } from './entities/localization.entity';
import { LocalizationsService } from './localizations.service';
import { LocalizationsController } from './localizations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Localization])],
  providers: [LocalizationsService],
  controllers: [LocalizationsController],
  exports: [LocalizationsService],
})
export class LocalizationsModule {} 