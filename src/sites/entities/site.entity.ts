import { ApiProperty } from '@nestjs/swagger';
import { Page } from '../../pages/entities/page.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SiteAccess } from 'src/site-access/entities/site-access.entity';
import { Block } from 'src/blocks/entities/block.entity';
import { Variable } from 'src/variables/entities/variable.entity';
import { Template } from 'src/templates/entities/template.entity';

@Entity('sites')
export class Site {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'My Site', description: 'Site name' })
  @Column()
  name: string;

  @ApiProperty({ example: 'https://mysite.com', description: 'Site URL' })
  @Column()
  url: string;

  @ApiProperty({ example: 'mysite.com', description: 'Domain' })
  @Column({ unique: true })
  domain: string;

  @ApiProperty({ example: 'Описание сайта', description: 'Site description', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 'https://mysite.com/favicon.ico', description: 'Favicon URL', required: false })
  @Column({ nullable: true })
  favicon: string;

  @ApiProperty({ example: 'https://mysite.com/logo.png', description: 'Logo URL', required: false })
  @Column({ nullable: true })
  logo: string;

  @ApiProperty({ example: 'light', description: 'Theme name', required: false })
  @Column({ type: 'text', nullable: true })
  theme: string;

  @ApiProperty({ example: 'Inter', description: 'Google Font family name', required: false })
  @Column({ type: 'text', nullable: true })
  googleFont: string;

  @ApiProperty({ example: 'User agent: *', description: 'robots.txt content', required: false })
  @Column({ type: 'text', nullable: true })
  robotsTxt: string;

  @ApiProperty({ example: '{"title":"My Site","description":"SEO desc"}', description: 'Meta tags (JSON)', required: false })
  @Column({ type: 'jsonb', nullable: true })
  meta: JSON;

  @ApiProperty({ example: 'site', description: 'Type of site', required: false })
  @Column({ type: 'text', nullable: true })
  type: string;

  @ApiProperty({ example: 1, description: 'Owner user ID' })
  @Column()
  ownerId: number;

  @ApiProperty({ example: true, description: 'Whether the site is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ example: '{"ru-RU":{"metaTitle":"My Site","metaDescription":"SEO desc"}}', description: 'Locales' })
  @Column({ type: 'jsonb', nullable: true })
  locales: JSON;  

  @ApiProperty({ example: '2023-05-15T10:30:00Z', description: 'Date when the site was created' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  

  @ApiProperty({ example: '2023-05-15T10:30:00Z', description: 'Date when the site was last updated' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ApiProperty({ example: true, description: 'Robots meta no index' })
  @Column({ default: false })
  robotsMetaNoIndex: boolean;

  @ApiProperty({ example: true, description: 'Whether localizations are enabled for this site' })
  @Column({ default: true })
  localizationsEnabled: boolean;

  @ApiProperty({ example: 'ru-RU', description: 'Default locale when localizations are disabled' })
  @Column({ type: 'text', nullable: true, default: 'ru-RU' })
  defaultLocale: string;

  @ApiProperty({ example: 'Global title', description: 'Global meta title when localizations disabled' })
  @Column({ type: 'text', nullable: true })
  globalMetaTitle: string;

  @ApiProperty({ example: 'Global description', description: 'Global meta description when localizations disabled' })
  @Column({ type: 'text', nullable: true })
  globalMetaDescription: string;

  @OneToMany(() => Page, (page) => page.site)
  pages: Page[];

  @OneToMany(() => SiteAccess, (siteAccess) => siteAccess.site)
  siteAccesses: SiteAccess[];

  @OneToMany(() => Block, (block) => block.site)
  blocks: Block[];

  @OneToMany(() => Variable, (variable) => variable.site)
  variables: Variable[];

  @OneToMany(() => Template, (template) => template.site)
  templates: Template[];
  
} 