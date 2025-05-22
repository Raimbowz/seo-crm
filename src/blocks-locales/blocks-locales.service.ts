import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockLocale } from './entities/block-locale.entity';
import { CreateBlockLocaleDto } from './dto/create-block-locale.dto';
import { UpdateBlockLocaleDto } from './dto/update-block-locale.dto';

@Injectable()
export class BlocksLocalesService {
  constructor(
    @InjectRepository(BlockLocale)
    private readonly blockLocaleRepository: Repository<BlockLocale>,
  ) {}

  async create(dto: CreateBlockLocaleDto) {
    const entity = this.blockLocaleRepository.create(dto);
    return await this.blockLocaleRepository.save(entity);
  }

  async findAll() {
    return await this.blockLocaleRepository.find();
  }

  async findOne(id: number) {
    return await this.blockLocaleRepository.findOneBy({ id });
  }

  async update(id: number, dto: UpdateBlockLocaleDto) {
    await this.blockLocaleRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return await this.blockLocaleRepository.delete(id);
  }
} 