import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Site } from '../../sites/entities/site.entity';

@Entity('partners')
export class Partner {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Acme Inc.', description: 'Partner company name' })
  @Column()
  name: string;

  @ApiProperty({
    example: 'Lead provider for trading platform',
    description: 'Partner description',
  })
  @Column({ nullable: true })
  description: string;

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

  @ApiProperty({
    example: 'https://api.partner.com/leads',
    description: 'API endpoint URL for lead submission',
  })
  @Column()
  apiUrl: string;

  @ApiProperty({ example: 'POST', description: 'HTTP method for API requests' })
  @Column({ default: 'POST' })
  apiMethod: string;

  @ApiProperty({
    example:
      '{"Authorization": "Bearer token123", "Content-Type": "application/json"}',
    description: 'Additional headers for API requests (JSON format)',
  })
  @Column({ type: 'text', nullable: true })
  apiHeaders: string;

  @ApiProperty({
    example:
      '{"firstName": "fname", "lastName": "lname", "email": "email", "phone": "profile[phone]"}',
    description: 'Field mapping from lead to partner API (JSON format)',
  })
  @Column({ type: 'text' })
  fieldMapping: string;

  @ApiProperty({ example: true, description: 'Whether the partner is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: 300,
    description: 'Delay in seconds before sending lead to partner (0 = immediate)',
    default: 0,
  })
  @Column({ default: 0 })
  delaySeconds: number;

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

  @ApiProperty({ description: 'Sites connected to this partner' })
  @ManyToMany(() => Site, (site) => site.partners)
  @JoinTable({
    name: 'partner_sites',
    joinColumn: { name: 'partnerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'siteId', referencedColumnName: 'id' },
  })
  sites: Site[];
}
