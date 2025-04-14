import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Template } from './template.entity';
import { Block } from '../../blocks/entities/block.entity';

@Entity('template_blocks')
export class TemplateBlock {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'Template ID' })
  @Column()
  templateId: number;

  @ApiProperty({ example: 1, description: 'Block ID' })
  @Column()
  blockId: number;

  @ApiProperty({
    example: 1,
    description: 'Order of the block in the template',
  })
  @Column()
  order: number;

  @ApiProperty({
    example: true,
    description: 'Whether the template block is active',
  })
  @Column({ default: true })
  isActive: boolean;

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

  @ManyToOne(() => Template, (template) => template.id)
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @ManyToOne(() => Block)
  @JoinColumn({ name: 'blockId' })
  block: Block;
}
