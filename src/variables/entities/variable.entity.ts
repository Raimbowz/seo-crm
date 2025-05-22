import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import { Site } from '../../sites/entities/site.entity';

@ApiExtraModels()
@Entity('variables')
export class Variable {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор переменной', type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Название переменной', description: 'Название переменной', type: String })
  @Column()
  name: string;

  @ApiProperty({ example: 'PAGE_TITLE', description: 'Ключ переменной. Используется как {{KEY}} в шаблоне.', type: String })
  @Column({ unique: true })
  key: string;

  @ApiProperty({ example: 'Главная страница', description: 'Значение переменной, которое будет подставлено вместо {{KEY}}.', type: String })
  @Column('text')
  value: string;

  @ApiProperty({ example: 'Комментарий к переменной', description: 'Комментарий к переменной', type: String })
  @Column('text', { nullable: true })
  comment: string;

  @ApiProperty({ example: true, description: 'Активна ли переменная. Только активные участвуют в парсинге.', type: Boolean, default: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ example: false, description: 'Является ли переменная системной. Системные переменные нельзя удалить.', type: Boolean, default: false })
  @Column({ default: false })
  isSystem: boolean;

  @ApiProperty({ example: 1, description: 'Идентификатор сайта', type: Number })
  @Column({ nullable: true })
  siteId: number;

  @ApiProperty({ example: '2024-04-17T10:42:00.000Z', description: 'Дата создания переменной', type: String, format: 'date-time' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2024-04-17T10:42:00.000Z', description: 'Дата последнего обновления переменной', type: String, format: 'date-time' })
  @UpdateDateColumn()
  updatedAt: Date;
  

  @ManyToOne(() => Site, (site) => site.variables)
  @JoinColumn({ name: 'siteId' })
  site: Site;
} 