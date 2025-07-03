import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, In } from 'typeorm';
import { LeadQueue, LeadQueueStatus } from './entities/lead-queue.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Partner } from '../partners/entities/partner.entity';
import { PartnersService } from '../partners/partners.service';

@Injectable()
export class LeadQueueService {
  private readonly logger = new Logger(LeadQueueService.name);

  constructor(
    @InjectRepository(LeadQueue)
    private readonly leadQueueRepository: Repository<LeadQueue>,
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    private readonly partnersService: PartnersService,
  ) {}

  /**
   * Добавить лид в очередь для всех активных партнеров сайта
   */
  async queueLeadForSite(lead: Lead, siteId: number): Promise<LeadQueue[]> {
    this.logger.log(`Queueing lead ${lead.id} for site ${siteId}`);

    // Получаем всех активных партнеров для данного сайта
    const partners = await this.partnerRepository
      .createQueryBuilder('partner')
      .innerJoin('partner.sites', 'site')
      .where('site.id = :siteId', { siteId })
      .andWhere('partner.isActive = :isActive', { isActive: true })
      .getMany();

    if (partners.length === 0) {
      this.logger.debug(`No active partners found for site ${siteId}`);
      return [];
    }

    const queueEntries: LeadQueue[] = [];

    for (const partner of partners) {
      // Вычисляем время отправки с учетом задержки
      const scheduledAt = new Date();
      scheduledAt.setSeconds(scheduledAt.getSeconds() + partner.delaySeconds);

      const queueEntry = this.leadQueueRepository.create({
        leadId: lead.id,
        partnerId: partner.id,
        status: LeadQueueStatus.NEW,
        scheduledAt: scheduledAt,
        attempts: 0,
        maxAttempts: 3,
      });

      queueEntries.push(queueEntry);
    }

    const savedEntries = await this.leadQueueRepository.save(queueEntries);
    
    this.logger.log(
      `Queued lead ${lead.id} for ${savedEntries.length} partners`,
    );

    return savedEntries;
  }

  /**
   * Получить записи готовые к обработке
   */
  async getReadyToProcess(): Promise<LeadQueue[]> {
    const now = new Date();
    
    return this.leadQueueRepository.find({
      where: {
        status: LeadQueueStatus.NEW,
        scheduledAt: LessThanOrEqual(now),
      },
      relations: ['lead', 'partner'],
      order: {
        scheduledAt: 'ASC',
      },
      take: 50, // Обрабатываем максимум 50 записей за раз
    });
  }

  /**
   * Обработать готовые записи очереди
   */
  async processQueue(): Promise<void> {
    const readyEntries = await this.getReadyToProcess();
    
    if (readyEntries.length === 0) {
      this.logger.debug('No entries ready to process');
      return;
    }

    this.logger.log(`Processing ${readyEntries.length} queue entries`);

    for (const entry of readyEntries) {
      await this.processQueueEntry(entry);
    }
  }

  /**
   * Обработать одну запись очереди
   */
  async processQueueEntry(entry: LeadQueue): Promise<void> {
    this.logger.debug(`Processing queue entry ${entry.id} for lead ${entry.leadId} and partner ${entry.partnerId}`);

    // Обновляем статус на "обрабатывается"
    await this.updateStatus(entry.id, LeadQueueStatus.PROCESSING, {
      processedAt: new Date(),
      attempts: entry.attempts + 1,
    });

    try {
      // Получаем полные данные лида и партнера
      const leadData = entry.lead;
      const partner = entry.partner;

      if (!leadData || !partner) {
        throw new Error('Lead or partner data not found');
      }

      // Отправляем лид партнеру
      const result = await this.partnersService.sendLeadToPartner(
        partner,
        leadData,
      );

      if (result.success) {
        // Успешно отправлено
        await this.updateStatus(entry.id, LeadQueueStatus.SENT, {
          completedAt: new Date(),
          partnerResponse: 'Lead sent successfully',
        });

        this.logger.log(
          `✅ Successfully sent lead ${entry.leadId} to partner ${entry.partnerId}`,
        );
      } else {
        // Детальная обработка ошибок
        let errorMessage = `${result.error}: ${result.message}`;
        if (result.statusCode) {
          errorMessage += ` (HTTP ${result.statusCode})`;
        }
        
        this.logger.error(
          `❌ Failed to send lead ${entry.leadId} to partner ${entry.partnerId}: ${errorMessage}`,
        );
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      this.logger.error(
        `Error processing queue entry ${entry.id}: ${error.message}`,
        error.stack,
      );

      // Проверяем, нужно ли повторить попытку
      if (entry.attempts + 1 >= entry.maxAttempts) {
        // Максимальное количество попыток достигнуто
        await this.updateStatus(entry.id, LeadQueueStatus.ERROR, {
          completedAt: new Date(),
          errorMessage: `Max attempts reached: ${error.message}`,
          partnerResponse: error.message,
        });
      } else {
        // Планируем повторную попытку через 5 минут
        const nextAttemptAt = new Date();
        nextAttemptAt.setMinutes(nextAttemptAt.getMinutes() + 5);

        await this.updateStatus(entry.id, LeadQueueStatus.NEW, {
          scheduledAt: nextAttemptAt,
          errorMessage: error.message,
        });
      }
    }
  }

  /**
   * Обновить статус записи очереди
   */
  async updateStatus(
    entryId: number,
    status: LeadQueueStatus,
    additionalData: Partial<LeadQueue> = {},
  ): Promise<void> {
    await this.leadQueueRepository.update(entryId, {
      status,
      ...additionalData,
    });
  }

  /**
   * Получить статистику очереди
   */
  async getQueueStats(): Promise<any> {
    const stats = await this.leadQueueRepository
      .createQueryBuilder('queue')
      .select('queue.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('queue.status')
      .getRawMany();

    const result = {
      new: 0,
      processing: 0,
      sent: 0,
      error: 0,
    };

    stats.forEach((stat) => {
      result[stat.status] = parseInt(stat.count);
    });

    return result;
  }

  /**
   * Получить записи очереди с пагинацией
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    status?: LeadQueueStatus,
    partnerId?: number,
  ): Promise<{ items: LeadQueue[]; total: number; page: number; limit: number }> {
    const query = this.leadQueueRepository.createQueryBuilder('queue')
      .leftJoinAndSelect('queue.lead', 'lead')
      .leftJoinAndSelect('queue.partner', 'partner')
      .orderBy('queue.createdAt', 'DESC');

    if (status) {
      query.andWhere('queue.status = :status', { status });
    }

    if (partnerId) {
      query.andWhere('queue.partnerId = :partnerId', { partnerId });
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Принудительно отправить запись очереди
   */
  async retryQueueEntry(entryId: number): Promise<void> {
    const entry = await this.leadQueueRepository.findOne({
      where: { id: entryId },
      relations: ['lead', 'partner'],
    });

    if (!entry) {
      throw new Error(`Queue entry ${entryId} not found`);
    }

    if (entry.status === LeadQueueStatus.PROCESSING) {
      throw new Error('Entry is already being processed');
    }

    // Сбрасываем статус и перепланируем на немедленную отправку
    await this.updateStatus(entryId, LeadQueueStatus.NEW, {
      scheduledAt: new Date(),
      errorMessage: undefined,
    });

    this.logger.log(`Rescheduled queue entry ${entryId} for immediate processing`);
  }
}