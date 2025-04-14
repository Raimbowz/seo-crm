import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
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

@ApiTags('pages')
@Controller('pages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
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
  @ApiOperation({ summary: 'Get all pages' })
  @ApiResponse({ status: 200, description: 'Return all pages', type: [Page] })
  findAll(): Promise<Page[]> {
    return this.pagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a page by id' })
  @ApiResponse({ status: 200, description: 'Return the page', type: Page })
  @ApiResponse({ status: 404, description: 'Page not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Page> {
    return this.pagesService.findOne(id);
  }

  @Put(':id')
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
    return this.pagesService.update(id, updatePageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a page' })
  @ApiResponse({ status: 200, description: 'Page deleted successfully' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.pagesService.remove(id);
  }
}
