import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Block } from '../../blocks/entities/block.entity';

@Entity('block_locales')
export class BlockLocale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  language: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: any;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  blockId: number;

  @ManyToOne(() => Block, block => block.locales, { onDelete: 'CASCADE' })
  block: Block;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 