import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { Block } from './entities/block.entity';

@ApiTags('blocks')
@Controller('blocks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new block' })
  @ApiResponse({
    status: 201,
    description: 'Block created successfully',
    type: Block,
  })
  create(@Body() createBlockDto: CreateBlockDto): Promise<Block> {
    return this.blocksService.create(createBlockDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blocks' })
  @ApiResponse({ status: 200, description: 'Return all blocks', type: [Block] })
  findAll(): Promise<Block[]> {
    return this.blocksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a block by id' })
  @ApiResponse({ status: 200, description: 'Return the block', type: Block })
  @ApiResponse({ status: 404, description: 'Block not found' })
  findOne(@Param('id') id: string): Promise<Block> {
    return this.blocksService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a block' })
  @ApiResponse({
    status: 200,
    description: 'Block updated successfully',
    type: Block,
  })
  @ApiResponse({ status: 404, description: 'Block not found' })
  update(
    @Param('id') id: string,
    @Body() updateBlockDto: UpdateBlockDto,
  ): Promise<Block> {
    return this.blocksService.update(+id, updateBlockDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a block' })
  @ApiResponse({ status: 200, description: 'Block deleted successfully' })
  @ApiResponse({ status: 404, description: 'Block not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.blocksService.remove(+id);
  }
}
