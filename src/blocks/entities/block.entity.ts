import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BlockLocale } from '../../blocks-locales/entities/block-locale.entity';
import { Site } from 'src/sites/entities/site.entity';

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
  @Column('jsonb')
  content: JSON;

  @ApiProperty({ description: 'The type of the block' })
  @Column()
  type: string;

  @ApiProperty({ description: 'Whether the block is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'The site id of the block' })
  @Column()
  siteId: number;

  @OneToMany(() => BlockLocale, (locale) => locale.block)
  locales: BlockLocale[];

  @ApiProperty({ description: 'Whether the block is global' })
  @Column({ default: false })
  isGlobal: boolean;

  @ApiProperty({ description: 'Whether to show buttons in the block' })
  @Column({ default: true })
  showButtons: boolean;

  @ApiProperty({ description: 'Whether to show contacts in the block' })
  @Column({ default: true })
  showContacts: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Site, (site) => site.blocks)
  site: Site;
}
