import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {}

  async create(createPageDto: CreatePageDto): Promise<Page> {
    // Check if a page with the same slug already exists
    const existingPage = await this.pageRepository.findOne({
      where: { slug: createPageDto.slug },
    });

    if (existingPage) {
      throw new BadRequestException('Page with this slug already exists');
    }

    const page = this.pageRepository.create(createPageDto);
    return this.pageRepository.save(page);
  }

  async findAll(): Promise<Page[]> {
    return this.pageRepository.find({
      relations: ['city', 'template', 'partner'],
    });
  }

  async findOne(id: number): Promise<Page> {
    const page = await this.pageRepository.findOne({
      where: { id },
      relations: ['city', 'template', 'partner'],
    });

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    return page;
  }

  async update(id: number, updatePageDto: UpdatePageDto): Promise<Page> {
    const page = await this.findOne(id);

    // If slug is being updated, check it's not already taken
    if (updatePageDto.slug && updatePageDto.slug !== page.slug) {
      const existingPage = await this.pageRepository.findOne({
        where: { slug: updatePageDto.slug },
      });

      if (existingPage) {
        throw new BadRequestException('Page with this slug already exists');
      }
    }

    this.pageRepository.merge(page, updatePageDto);
    return this.pageRepository.save(page);
  }

  async remove(id: number): Promise<void> {
    const page = await this.findOne(id);
    await this.pageRepository.remove(page);
  }
}
