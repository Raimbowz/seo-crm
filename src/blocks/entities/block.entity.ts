import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum BlockType {
  HEADER = 'header',
  FOOTER = 'footer',
  CONTENT = 'content',
  HERO = 'hero',
  TESTIMONIAL = 'testimonial',
  CONTACT = 'contact',
}

@Entity('blocks')
export class Block {
  @ApiProperty({ description: 'The unique identifier of the block' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The name of the block' })
  @Column()
  name: string;

  @ApiProperty({ description: 'The content of the block' })
  @Column('text')
  content: string;

  @ApiProperty({ description: 'The type of the block' })
  @Column()
  type: string;

  @ApiProperty({ description: 'Whether the block is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
