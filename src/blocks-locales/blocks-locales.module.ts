import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockLocale } from './entities/block-locale.entity';
import { BlocksLocalesService } from './blocks-locales.service';
import { BlocksLocalesController } from './blocks-locales.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BlockLocale])],
  providers: [BlocksLocalesService],
  controllers: [BlocksLocalesController],
  exports: [BlocksLocalesService],
})
export class BlocksLocalesModule {} 