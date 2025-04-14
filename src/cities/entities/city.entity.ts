import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Page } from '../../pages/entities/page.entity';

@Entity('cities')
export class City {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Москва', description: 'City name (nominative case)' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: 'Москвы', description: 'City name in genitive case' })
  @Column({ nullable: true })
  nameGenitive: string;

  @ApiProperty({ example: 'Москве', description: 'City name in dative case' })
  @Column({ nullable: true })
  nameDative: string;

  @ApiProperty({ example: 'Москву', description: 'City name in accusative case' })
  @Column({ nullable: true })
  nameAccusative: string;

  @ApiProperty({ example: 'Москвой', description: 'City name in instrumental case' })
  @Column({ nullable: true })
  nameInstrumental: string;

  @ApiProperty({ example: 'Москве', description: 'City name in prepositional case' })
  @Column({ nullable: true })
  namePrepositional: string;

  @ApiProperty({ example: true, description: 'Whether the city is active' })
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

  @OneToMany(() => Page, (page) => page.city)
  pages: Page[];
}
