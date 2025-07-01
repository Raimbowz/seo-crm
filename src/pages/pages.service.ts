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
    if (createPageDto.parentId) {
      page.parentId = createPageDto.parentId;
      page.parent = { id: createPageDto.parentId } as any;
    }
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
    page.templateId = updatePageDto.templateId || page.templateId;
    this.pageRepository.merge(page, updatePageDto);

    if (updatePageDto.templateId) {
      page.templateId = updatePageDto.templateId;
      page.template = { id: updatePageDto.templateId } as any;
    }

    if (updatePageDto.parentId !== undefined) {
      page.parentId = updatePageDto.parentId;
      page.parent = updatePageDto.parentId
        ? ({ id: updatePageDto.parentId } as any)
        : null;
    }

    if (updatePageDto.partnerId) {
      page.partnerId = updatePageDto.partnerId;
      page.partner = { id: updatePageDto.partnerId } as any;
    }

    if (updatePageDto.siteId) {
      page.siteId = updatePageDto.siteId || page.siteId;
      page.site = { id: updatePageDto.siteId } as any;
    }

    const res = await this.pageRepository.save(page);
    console.log('res:', res);
    return res;
  }

  async remove(id: number): Promise<void> {
    const page = await this.findOne(id);
    await this.pageRepository.remove(page);
  }

  async findBySiteId(siteId: number): Promise<Page[]> {
    // Получаем страницы конкретного сайта + глобальные страницы
    return this.pageRepository.find({
      where: [
        { site: { id: siteId } }, // Страницы этого сайта
        { isGlobal: true }, // Глобальные страницы
      ],
      relations: ['template'],
    });
  }

  async findThankYouPageBySiteId(siteId: number): Promise<Page | null> {
    return this.pageRepository.findOne({
      where: [
        { siteId: siteId, isThankYouPage: true, isActive: true },
        { isGlobal: true, isThankYouPage: true, isActive: true },
      ],
      relations: ['template'],
      order: {
        isGlobal: 'ASC', // Prefer site-specific over global
        id: 'ASC',
      },
    });
  }
}
