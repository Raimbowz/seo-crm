import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeadQueueService } from './lead-queue.service';

@Injectable()
export class LeadQueueScheduler {
  private readonly logger = new Logger(LeadQueueScheduler.name);

  constructor(private readonly leadQueueService: LeadQueueService) {}

  @Cron('*/10 * * * * *') // Каждые 10 секунд
  async processLeadQueue() {
    this.logger.debug('Processing lead queue...');
    
    try {
      await this.leadQueueService.processQueue();
    } catch (error) {
      this.logger.error('Error processing lead queue:', error.stack);
    }
  }

  @Cron(CronExpression.EVERY_HOUR) // Каждый час
  async logQueueStats() {
    try {
      const stats = await this.leadQueueService.getQueueStats();
      this.logger.log(`Queue stats: ${JSON.stringify(stats)}`);
    } catch (error) {
      this.logger.error('Error getting queue stats:', error.stack);
    }
  }
}