import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BlocksLocalesService } from './blocks-locales.service';
import { CreateBlockLocaleDto } from './dto/create-block-locale.dto';
import { UpdateBlockLocaleDto } from './dto/update-block-locale.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Block Locales')
@Controller('block-locales')
@ApiBearerAuth()
export class BlocksLocalesController {
  constructor(private readonly blocksLocalesService: BlocksLocalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create block locale' })
  @ApiCreatedResponse({ description: 'Block locale created' })
  async create(@Body() dto: CreateBlockLocaleDto) {
    return await this.blocksLocalesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all block locales' })
  @ApiOkResponse({ description: 'List of block locales' })
  async findAll() {
    return await this.blocksLocalesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get block locale by id' })
  @ApiOkResponse({ description: 'Block locale by id' })
  async findOne(@Param('id') id: string) {
    return await this.blocksLocalesService.findOne(Number(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update block locale' })
  @ApiOkResponse({ description: 'Block locale updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateBlockLocaleDto) {
    return await this.blocksLocalesService.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete block locale' })
  @ApiOkResponse({ description: 'Block locale deleted' })
  async remove(@Param('id') id: string) {
    return await this.blocksLocalesService.remove(Number(id));
  }
}
