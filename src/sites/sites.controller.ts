import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../enums/user-roles.enum';

@ApiTags('Sites')
@Controller('sites')
@ApiBearerAuth()
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать сайт' })
  @ApiCreatedResponse({ description: 'Сайт создан' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN,UserRole.CREATOR)
  async create(@Body() dto: CreateSiteDto) {
    return await this.sitesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все сайты (admin: все, user: только доступные)' })
  @ApiOkResponse({ description: 'Список сайтов' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN,UserRole.CREATOR)
  async findAll(@Req() req) {
    const user = req.user;
    return await this.sitesService.findAllByUser(user?.id, user?.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить сайт по id с страницами, шаблонами, блоками' })
  @ApiOkResponse({ description: 'Сайт по id с всеми вложенными данными' })
  async findOne(@Param('id') id: string) {
    return await this.sitesService.findOneWithPagesAndTemplatesAndBlocks(Number(id));
  }

  @Get('domain/:domain')
  @ApiOperation({ summary: 'Получить сайт по домену' })
  @ApiOkResponse({ description: 'Сайт по домену' })
  async findOneByDomain(@Param('domain') domain: string) {
    return await this.sitesService.findOneWithPagesAndTemplatesAndBlocks(domain);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN,UserRole.CREATOR)
  @ApiOperation({ summary: 'Обновить сайт' })
  @ApiOkResponse({ description: 'Сайт обновлен' })
  async update(@Param('id') id: string, @Body() dto: UpdateSiteDto) {
    return await this.sitesService.update(Number(id), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN,UserRole.CREATOR)
  @ApiOperation({ summary: 'Удалить сайт' })
  @ApiOkResponse({ description: 'Сайт удален' })
  async remove(@Param('id') id: string) {
    return await this.sitesService.remove(Number(id));
  }
} 