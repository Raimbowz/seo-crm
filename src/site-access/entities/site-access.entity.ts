import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn     } from 'typeorm';
import { User } from 'src/users-proxy/user.entity';
import { Site } from 'src/sites/entities/site.entity';

@Entity('site_access')
export class SiteAccess {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'User ID' })
  @Column()
  userId: number;

  @ApiProperty({ example: 1, description: 'Site ID' })
  @Column()
  siteId: number;

  @ApiProperty({ example: '{"edit":true,"view":true}', description: 'Permissions (JSON)', required: false })
  @Column({ type: 'jsonb', nullable: true })
  permissions: any;

  @ApiProperty({ example: '2023-05-15T10:30:00Z', description: 'Date when the access was created' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({ example: '2023-05-15T10:30:00Z', description: 'Date when the access was last updated' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  


  @ManyToOne(() => Site, (site) => site.siteAccesses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'siteId' })
  site: Site;
} 