import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Page } from '../../pages/entities/page.entity';

export enum LeadStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  CONVERTED = 'converted',
  CLOSED = 'closed',
  REJECTED = 'rejected',
}

@Entity('leads')
export class Lead {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'John', description: 'Lead first name' })
  @Column()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Lead last name' })
  @Column()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Lead email' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Lead phone number' })
  @Column()
  phone: string;

  @ApiProperty({
    example: 'I need a consultation',
    description: 'Lead message',
  })
  @Column({ type: 'text', nullable: true })
  message: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Creation date',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Last update date',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  source: string;

  @ApiProperty({
    enum: LeadStatus,
    example: LeadStatus.NEW,
    description: 'Lead status',
  })
  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  locale: string;

  @Column({ nullable: true })
  referer: string;

  @Column({ type: 'json', nullable: true })
  formData: any;

  @ManyToOne(() => Page)
  @JoinColumn({ name: 'pageId' })
  page: Page;
}
