import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './entities/block.entity';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
  ) {}

  async create(createBlockDto: CreateBlockDto): Promise<Block> {
    const block = this.blockRepository.create(createBlockDto);
    return await this.blockRepository.save(block);
  }

  async findAll(): Promise<Block[]> {
    return await this.blockRepository.find();
  }

  async findOne(id: number): Promise<Block> {
    const block = await this.blockRepository.findOne({ where: { id } });

    if (!block) {
      throw new NotFoundException(`Block with ID ${id} not found`);
    }

    return block;
  }

  async update(id: number, updateBlockDto: UpdateBlockDto): Promise<Block> {
    const block = await this.findOne(id);
    Object.assign(block, updateBlockDto);
    return await this.blockRepository.save(block);
  }

  async remove(id: number): Promise<void> {
    const block = await this.findOne(id);
    await this.blockRepository.remove(block);
  }
}
