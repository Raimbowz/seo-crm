import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { City } from '../../cities/entities/city.entity';
import { Partner } from '../../partners/entities/partner.entity';
import { Template } from '../../templates/entities/template.entity';

@Entity('pages')
export class Page {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Home Page', description: 'Page title' })
  @Column()
  title: string;

  @ApiProperty({ example: 'home-page', description: 'SEO-friendly URL slug' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({
    example: 'Welcome to our website',
    description: 'Page meta description',
  })
  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @ApiProperty({
    example: 'home, page, website',
    description: 'Page meta keywords',
  })
  @Column({ nullable: true })
  metaKeywords: string;

  @ApiProperty({ example: 1, description: 'City ID' })
  @Column()
  cityId: number;

  @ApiProperty({ example: 1, description: 'Template ID' })
  @Column()
  templateId: number;

  @ApiProperty({ example: 1, description: 'Partner ID', required: false })
  @Column({ nullable: true })
  partnerId: number;

  @ApiProperty({ example: true, description: 'Whether the page is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: '2023-05-15T10:30:00Z',
    description: 'Date when the page was created',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-15T10:30:00Z',
    description: 'Date when the page was last updated',
  })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'cityId' })
  city: City;

  @ManyToOne(() => Template)
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @ManyToOne(() => Partner, { nullable: true })
  @JoinColumn({ name: 'partnerId' })
  partner: Partner;
}
