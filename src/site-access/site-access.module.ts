import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteAccess } from './entities/site-access.entity';
import { SiteAccessService } from './site-access.service';
import { SiteAccessController } from './site-access.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../config/config.module';
import { UsersProxyModule } from '../users-proxy/users-proxy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SiteAccess]),
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule,
    UsersProxyModule,
  ],
  providers: [SiteAccessService],
  controllers: [SiteAccessController],
  exports: [SiteAccessService],
})
export class SiteAccessModule {}
