import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersProxyService } from './users-proxy.service';

@Controller('users-proxy')
export class UsersProxyController {
  constructor(private readonly usersProxyService: UsersProxyService) {}

  @Get()
  async findAll(@Req() req: Request) {
    return this.usersProxyService.findAll(req);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Req() req: Request) {
    return this.usersProxyService.findOne(id, req);
  }

  @Post()
  async create(@Body() data: any, @Req() req: Request) {
    return this.usersProxyService.create(data, req);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() data: any,
    @Req() req: Request,
  ) {
    return this.usersProxyService.update(id, data, req);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Req() req: Request) {
    return this.usersProxyService.delete(id, req);
  }
}
