import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Page } from '../../pages/entities/page.entity';

@Entity('partners')
export class Partner {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Acme Inc.', description: 'Partner company name' })
  @Column()
  name: string;

  @ApiProperty({ example: 'John Doe', description: 'Partner contact person' })
  @Column()
  contactPerson: string;

  @ApiProperty({
    example: 'john@acme.com',
    description: 'Partner email address',
  })
  @Column()
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Partner phone number' })
  @Column()
  phone: string;

  @ApiProperty({
    example: 'https://www.acme.com',
    description: 'Partner website URL',
    required: false,
  })
  @Column({ nullable: true })
  website: string;

  @ApiProperty({ example: true, description: 'Whether the partner is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: '2023-05-15T10:30:00Z',
    description: 'Date when the partner was created',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-15T10:30:00Z',
    description: 'Date when the partner was last updated',
  })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => Page, (page) => page.partner)
  pages: Page[];
}
