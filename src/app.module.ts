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
  
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    CitiesModule,
    BlocksModule,
    TemplatesModule,
    PagesModule,
    LeadsModule,
    PartnersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
