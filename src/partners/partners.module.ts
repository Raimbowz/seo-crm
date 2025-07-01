import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Partner } from './entities/partner.entity';
import { Site } from '../sites/entities/site.entity';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partner, Site]),
    HttpModule,
    AuthModule,
    ConfigModule,
  ],
  controllers: [PartnersController],
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {}
