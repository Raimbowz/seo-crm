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
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { Partner } from './entities/partner.entity';

@ApiTags('partners')
@Controller('partners')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new partner' })
  @ApiResponse({
    status: 201,
    description: 'Partner created successfully',
    type: Partner,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createPartnerDto: CreatePartnerDto): Promise<Partner> {
    return this.partnersService.create(createPartnerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all partners' })
  @ApiResponse({
    status: 200,
    description: 'Return all partners',
    type: [Partner],
  })
  findAll(): Promise<Partner[]> {
    return this.partnersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a partner by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the partner',
    type: Partner,
  })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Partner> {
    return this.partnersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a partner' })
  @ApiResponse({
    status: 200,
    description: 'Partner updated successfully',
    type: Partner,
  })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ): Promise<Partner> {
    return this.partnersService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a partner' })
  @ApiResponse({ status: 200, description: 'Partner deleted successfully' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.partnersService.remove(id);
  }
}
