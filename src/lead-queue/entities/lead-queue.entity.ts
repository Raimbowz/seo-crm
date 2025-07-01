import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Lead } from '../../leads/entities/lead.entity';
import { Partner } from '../../partners/entities/partner.entity';

export enum LeadQueueStatus {
  NEW = 'new',
  PROCESSING = 'processing', 
  SENT = 'sent',
  ERROR = 'error',
}

@Entity('lead_queue')
@Index(['status', 'scheduledAt'])
@Index(['partnerId', 'status'])
@Index(['leadId'])
export class LeadQueue {
  @ApiProperty({
    example: 1,
    description: 'Уникальный идентификатор записи очереди',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID лида',
  })
  @Column()
  leadId: string;

  @ApiProperty({
    example: 1,
    description: 'ID партнера',
  })
  @Column()
  partnerId: number;

  @ApiProperty({
    example: LeadQueueStatus.NEW,
    description: 'Статус отправки',
    enum: LeadQueueStatus,
  })
  @Column({
    type: 'enum',
    enum: LeadQueueStatus,
    default: LeadQueueStatus.NEW,
  })
  status: LeadQueueStatus;

  @ApiProperty({
    example: '2025-07-01T15:30:00.000Z',
    description: 'Дата/время когда запись должна быть обработана (с учетом задержки)',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  scheduledAt: Date;

  @ApiProperty({
    example: '2025-07-01T15:30:05.000Z',
    description: 'Дата/время начала обработки',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @ApiProperty({
    example: '2025-07-01T15:30:10.000Z',
    description: 'Дата/время завершения обработки',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @ApiProperty({
    example: 3,
    description: 'Количество попыток отправки',
    default: 0,
  })
  @Column({ default: 0 })
  attempts: number;

  @ApiProperty({
    example: 5,
    description: 'Максимальное количество попыток',
    default: 3,
  })
  @Column({ default: 3 })
  maxAttempts: number;

  @ApiProperty({
    example: '{"status": "success", "id": "partner_lead_123"}',
    description: 'Ответ партнера при отправке (JSON)',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  partnerResponse: string;

  @ApiProperty({
    example: 'Connection timeout',
    description: 'Сообщение об ошибке (если есть)',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @ApiProperty({
    example: '{"firstName": "John", "email": "john@example.com"}',
    description: 'Данные лида, отправленные партнеру (JSON)',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  sentData: string;

  @ApiProperty({
    example: '2025-07-01T15:25:00.000Z',
    description: 'Дата создания записи',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2025-07-01T15:30:10.000Z',
    description: 'Дата последнего обновления записи',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Lead, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @ManyToOne(() => Partner, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partnerId' })
  partner: Partner;
}