import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { City } from './entities/city.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BadRequestException } from '@nestjs/common';

@ApiTags('cities')
@Controller('cities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new city' })
  @ApiCreatedResponse({
    description: 'The city has been successfully created',
    type: City,
  })
  create(@Body() createCityDto: CreateCityDto): Promise<City> {
    return this.citiesService.create(createCityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cities' })
  @ApiOkResponse({
    description: 'List of all cities',
    type: [City],
  })
  async findAll()  {
    try {
      return await this.citiesService.findAll();
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a city by ID' })
  @ApiOkResponse({
    description: 'The city with the specified ID',
    type: City,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<City> {
    return this.citiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a city by ID' })
  @ApiOkResponse({
    description: 'The city has been successfully updated',
    type: City,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCityDto: UpdateCityDto,
  ): Promise<City> {
    return this.citiesService.update(id, updateCityDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a city by ID' })
  @ApiNoContentResponse({
    description: 'The city has been successfully deleted',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.citiesService.remove(id);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Bulk update cities' })
  @ApiOkResponse({ description: 'Cities updated', type: [City] })
  async updateMany(@Body() dtos: Array<{ id: number } & UpdateCityDto>): Promise<City[]> {
    return this.citiesService.updateMany(dtos)
  }
}
