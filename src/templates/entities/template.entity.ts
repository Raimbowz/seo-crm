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
import { Site } from 'src/sites/entities/site.entity';

@Entity('templates')
export class Template {
  @ApiProperty({ description: 'The unique identifier of the template' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The name of the template' })
  @Column()
  name: string;

  @ApiProperty({ description: 'The description of the template' })
  @Column()
  description: string;

  @ApiProperty({ description: 'The content of the template' })
  @Column('text')
  content: string;

  @ApiProperty({ description: 'The type of the template' })
  @Column()
  type: string;

  @ApiProperty({ description: 'The site ID of the template' })
  @Column()
  siteId: number;

  @ApiProperty({ description: 'Whether the template is global' })
  @Column({ default: false })
  isGlobal: boolean;

  @ApiProperty({ description: 'Whether the template is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Site, (site) => site.templates)
  @JoinColumn({ name: 'siteId' })
  site: Site;
}
