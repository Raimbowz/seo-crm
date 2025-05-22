import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly citiesRepository: Repository<City>,
  ) {}

  async create(createCityDto: CreateCityDto): Promise<City> {
    // Check if a city with the same name already exists
    const existingCity = await this.citiesRepository.findOne({
      where: { name: createCityDto.name },
    });

    if (existingCity) {
      throw new BadRequestException('City with this name already exists');
    }

    const city = this.citiesRepository.create(createCityDto);
    return this.citiesRepository.save(city);
  }

  async findAll(): Promise<City[]> {
    return this.citiesRepository.find();
  }

  async findByName(name: string): Promise<City[]> {
    return this.citiesRepository.find({
      where: { name },
    });
  }

  async findOne(id: number): Promise<City> {
    const city = await this.citiesRepository.findOne({ where: { id } });

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    return city;
  }

  async update(id: number, updateCityDto: UpdateCityDto): Promise<City> {
    const city = await this.findOne(id);

    // If name is being updated, check it's not already taken
    if (updateCityDto.name && updateCityDto.name !== city.name) {
      const existingCity = await this.citiesRepository.findOne({
        where: { name: updateCityDto.name },
      });

      if (existingCity && existingCity.id !== city.id) {
        throw new BadRequestException('City with this name already exists');
      }
    }

    // Update the city
    Object.assign(city, updateCityDto);
    return this.citiesRepository.save(city);
  }

  async remove(id: number): Promise<void> {
    const city = await this.findOne(id);
    await this.citiesRepository.remove(city);
  }

  async updateMany(dtos: Array<{ id: number } & UpdateCityDto>): Promise<City[]> {
    const result: City[] = [];
    for (const dto of dtos) {
      const { id, ...updateData } = dto;
      const updated = await this.update(id, updateData);
      result.push(updated);
    }
    return result;
  }
}
