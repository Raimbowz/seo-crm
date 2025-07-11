import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './config/database.module';
import { AuthModule } from './auth/auth.module';
import { CitiesModule } from './cities/cities.module';
import { BlocksModule } from './blocks/blocks.module';
import { TemplatesModule } from './templates/templates.module';
import { PagesModule } from './pages/pages.module';
import { LeadsModule } from './leads/leads.module';
import { PartnersModule } from './partners/partners.module';
import { VariablesModule } from './variables/variables.module';
import { ImagesModule } from './images/images.module';
import { SitesModule } from './sites/sites.module';
import { SiteAccessModule } from './site-access/site-access.module';
import { LocalizationsModule } from './localizations/localizations.module';
import { UsersProxyModule } from './users-proxy/users-proxy.module';
import { LeadQueueModule } from './lead-queue/lead-queue.module';
import { AiModule } from './ai/ai.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ScheduleModule.forRoot(),
    AuthModule,
    CitiesModule,
    BlocksModule,
    TemplatesModule,
    PagesModule,
    LeadsModule,
    PartnersModule,
    VariablesModule,
    ImagesModule,
    SitesModule,
    SiteAccessModule,
    LocalizationsModule,
    UsersProxyModule,
    LeadQueueModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
