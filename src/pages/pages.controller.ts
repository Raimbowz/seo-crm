import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Page } from './entities/page.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-roles.enum';

@ApiTags('pages')
@Controller('pages')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @ApiOperation({ summary: 'Create a new page' })
  @ApiResponse({
    status: 201,
    description: 'Page created successfully',
    type: Page,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createPageDto: CreatePageDto): Promise<Page> {
    return this.pagesService.create(createPageDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @ApiOperation({ summary: 'Get all pages' })
  @ApiResponse({ status: 200, description: 'Return all pages', type: [Page] })
  findAll(): Promise<Page[]> {
    return this.pagesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @ApiOperation({ summary: 'Get a page by id' })
  @ApiResponse({ status: 200, description: 'Return the page', type: Page })
  @ApiResponse({ status: 404, description: 'Page not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Page> {
    return this.pagesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @ApiOperation({ summary: 'Update a page' })
  @ApiResponse({
    status: 200,
    description: 'Page updated successfully',
    type: Page,
  })
  @ApiResponse({ status: 404, description: 'Page not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePageDto: UpdatePageDto,
  ): Promise<Page> {
    console.log('updatePageDto:', updatePageDto);
    return this.pagesService.update(id, updatePageDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @ApiOperation({ summary: 'Delete a page' })
  @ApiResponse({ status: 200, description: 'Page deleted successfully' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.pagesService.remove(id);
  }
}
