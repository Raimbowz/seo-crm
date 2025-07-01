import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('localizations')
export class Localization {
  @ApiProperty({ example: 1, description: 'ID локализации' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'ru', description: 'Язык локализации' })
  @Column()
  language: string;

  @ApiProperty({ example: 'Название', required: false })
  @Column({ nullable: true })
  name: string;

  @ApiProperty({ example: 'Описание', required: false })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ example: 'Текст', required: false })
  @Column({ nullable: true, type: 'text' })
  text: string;

  @ApiProperty({ example: 'Контент', required: false })
  @Column({ nullable: true, type: 'text' })
  content: string;

  @ApiProperty({ example: true, required: false })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Дата создания',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Дата обновления',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
