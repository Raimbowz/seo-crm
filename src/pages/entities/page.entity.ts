import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { City } from '../../cities/entities/city.entity';
import { Partner } from '../../partners/entities/partner.entity';
import { Template } from '../../templates/entities/template.entity';
import { Site } from '../../sites/entities/site.entity';
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
  @Column({ nullable: true })
  cityId: number;

  @ApiProperty({ example: 1, description: 'Site ID' })
  @Column()
  siteId: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Template ID' })
  @Column()
  templateId: string;

  @ApiProperty({ example: 1, description: 'Partner ID', required: false })
  @Column({ nullable: true })
  partnerId: number;

  @ApiProperty({ example: true, description: 'Whether the page is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ example: true, description: 'Whether the page is global' })
  @Column({ default: false })
  isGlobal: boolean;

  @ApiProperty({ example: true, description: 'Whether the page is main/homepage' })
  @Column({ default: false })
  isMain: boolean;

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

  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => Page, (page) => page.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentId' })
  parent: Page;

  @OneToMany(() => Page, (page) => page.parent)
  children: Page[];

  @ManyToOne(() => City)
  @JoinColumn({ name: 'cityId' })
  city: City;

  @ManyToOne(() => Template)
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @ManyToOne(() => Partner, { nullable: true })
  @JoinColumn({ name: 'partnerId' })
  partner: Partner;

  @ManyToOne(() => Site)
  @JoinColumn({ name: 'siteId' })
  site: Site;
}
