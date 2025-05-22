import { Module } from '@nestjs/common';
import { UsersProxyController } from './users-proxy.controller';
import { UsersProxyService } from './users-proxy.service';
 
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [UsersProxyController],
  providers: [UsersProxyService],
  exports: [UsersProxyService],
})
export class UsersProxyModule {} 