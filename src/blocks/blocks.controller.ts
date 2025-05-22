import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
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
import { BadRequestException } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-roles.enum';

@ApiTags('blocks')
@Controller('blocks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new block' })
  @Roles(UserRole.ADMIN,UserRole.CREATOR)
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
  @Roles(UserRole.ADMIN,UserRole.CREATOR)
  @ApiResponse({ status: 200, description: 'Return all blocks', type: [Block] })
  async findAll(): Promise<Block[]> {
    try {
      return await this.blocksService.findAll();
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a block by id' })
  @Roles(UserRole.ADMIN,UserRole.CREATOR)
  @ApiResponse({ status: 200, description: 'Return the block', type: Block })
  @ApiResponse({ status: 404, description: 'Block not found' })
  findOne(@Param('id') id: string): Promise<Block> {
    return this.blocksService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a block' })
  @Roles(UserRole.ADMIN,UserRole.CREATOR)
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
  @Roles(UserRole.ADMIN,UserRole.CREATOR)
  @ApiResponse({ status: 200, description: 'Block deleted successfully' })
  @ApiResponse({ status: 404, description: 'Block not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.blocksService.remove(+id);
  }
}
