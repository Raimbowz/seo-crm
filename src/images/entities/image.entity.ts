import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  link: string;

  @Column({ nullable: true })
  group: string;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  siteId: number;

  @Column({ default: false })
  isGlobal: boolean;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 