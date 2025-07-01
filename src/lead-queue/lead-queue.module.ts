import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadQueue } from './entities/lead-queue.entity';
import { LeadQueueService } from './lead-queue.service';
import { LeadQueueController } from './lead-queue.controller';
import { LeadQueueScheduler } from './lead-queue.scheduler';
import { Partner } from '../partners/entities/partner.entity';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeadQueue, Partner]),
    PartnersModule,
  ],
  providers: [LeadQueueService, LeadQueueScheduler],
  controllers: [LeadQueueController],
  exports: [LeadQueueService],
})
export class LeadQueueModule {}