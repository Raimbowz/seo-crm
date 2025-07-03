import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from './entities/site.entity';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { SiteAccess } from '../site-access/entities/site-access.entity';
import { SiteAccessModule } from '../site-access/site-access.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../config/config.module';
import { PagesModule } from '../pages/pages.module';
import { TemplatesModule } from '../templates/templates.module';
import { BlocksModule } from '../blocks/blocks.module';
import { AuthModule } from '../auth/auth.module';
import { VariablesModule } from '../variables/variables.module';
import { CitiesModule } from '../cities/cities.module';
import { ImagesModule } from '../images/images.module';
import { VariableReplacementService } from '../common/services/variable-replacement.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Site, SiteAccess]),
    SiteAccessModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule,
    PagesModule,
    TemplatesModule,
    BlocksModule,
    AuthModule,
    VariablesModule,
    CitiesModule,
    ImagesModule,
  ],
  providers: [SitesService, VariableReplacementService],
  controllers: [SitesController],
  exports: [SitesService],
})
export class SitesModule {}
