import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SiteAccessService } from './site-access.service';
import { CreateSiteAccessDto } from './dto/create-site-access.dto';
import { UpdateSiteAccessDto } from './dto/update-site-access.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Request } from 'express';
@ApiTags('SiteAccess')
@Controller('site-access')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SiteAccessController {
  constructor(private readonly siteAccessService: SiteAccessService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @ApiOperation({ summary: 'Create site access' })
  @ApiCreatedResponse({ description: 'Site access created' })
  async create(@Body() dto: CreateSiteAccessDto) {
    return await this.siteAccessService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @ApiOperation({ summary: 'Get all site accesses' })
  @ApiOkResponse({ description: 'List of site accesses' })
  async findAll(@Req() req: Request) {
    return await this.siteAccessService.findAll(req);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @ApiOperation({ summary: 'Get site access by id' })
  @ApiOkResponse({ description: 'Site access by id' })
  async findOne(@Param('id') id: string) {
    return await this.siteAccessService.findOne(Number(id));
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @ApiOperation({ summary: 'Update site access' })
  @ApiOkResponse({ description: 'Site access updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateSiteAccessDto) {
    return await this.siteAccessService.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @ApiOperation({ summary: 'Delete site access' })
  @ApiOkResponse({ description: 'Site access deleted' })
  async remove(@Param('id') id: string) {
    return await this.siteAccessService.remove(Number(id));
  }
}
