import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import { Image } from './entities/image.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@Injectable()
export class ImagesService {
  private readonly imageServiceUrl = process.env.IMAGE_SERVICE_URL || 'http://localhost:3100';

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly httpService: HttpService,
  ) {}

  async create(createImageDto: CreateImageDto): Promise<Image> {
    const image = this.imageRepository.create(createImageDto);
    return this.imageRepository.save(image);
  }

  async findAll(siteId?: number, includeGlobal = true): Promise<Image[]> {
    const queryBuilder = this.imageRepository.createQueryBuilder('image');
    
    console.log('ImagesService.findAll called with:', { siteId, includeGlobal });
    
    if (siteId !== undefined) {
      if (includeGlobal) {
        // Показываем изображения конкретного сайта + глобальные
        queryBuilder.where('(image.siteId = :siteId OR image.isGlobal = true)', { siteId });
        console.log('Query: siteId specific + global');
      } else {
        // Показываем только изображения конкретного сайта
        queryBuilder.where('image.siteId = :siteId', { siteId });
        console.log('Query: siteId specific only');
      }
    } else {
      if (includeGlobal) {
        // Показываем все изображения
        // Никаких условий не добавляем
        console.log('Query: all images');
      } else {
        // Показываем только глобальные изображения (когда siteId не указан и includeGlobal = false)
        queryBuilder.where('image.isGlobal = true');
        console.log('Query: global only');
      }
    }
    
    const sql = queryBuilder.getSql();
    const params = queryBuilder.getParameters();
    console.log('Generated SQL:', sql, 'Params:', params);
    
    return queryBuilder.orderBy('image.createdAt', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Image> {
    const image = await this.imageRepository.findOne({ where: { id } });
    if (!image) throw new NotFoundException('Image not found');
    return image;
  }

  async findByLink(link: string): Promise<Image | null> {
    return this.imageRepository.findOne({ where: { link } });
  }

  async update(id: number, updateImageDto: UpdateImageDto): Promise<Image> {
    const image = await this.findOne(id);
    Object.assign(image, updateImageDto);
    return this.imageRepository.save(image);
  }

  async remove(id: number): Promise<void> {
    const image = await this.findOne(id);
    
    // Попытаемся удалить с внешнего сервиса
    if (image.link) {
      await this.deleteFromExternalService(image.link);
    }
    
    await this.imageRepository.remove(image);
  }

  async uploadToExternalService(buffer: Buffer, filename: string): Promise<any> {
    try {
      // Определяем content-type по расширению файла
      const ext = filename.toLowerCase().split('.').pop();
      let contentType = 'image/jpeg';
      if (ext === 'png') contentType = 'image/png';
      else if (ext === 'webp') contentType = 'image/webp';
      else if (ext === 'gif') contentType = 'image/gif';

      const formData = new FormData();
      formData.append('file', buffer, {
        filename: filename,
        contentType: contentType,
      });
      // Добавляем параметры оптимизации
      formData.append('optimize', 'true');

      const response = await firstValueFrom(
        this.httpService.post(`${this.imageServiceUrl}/images/upload`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
        })
      );

      // Локальный сервис возвращает полную информацию об изображении
      return response.data;
    } catch (error) {
      console.error('Upload error details:', error.response?.data || error.message);
      throw new Error(`Failed to upload to external service: ${error.response?.data?.message || error.message}`);
    }
  }

  async deleteFromExternalService(imageUrl: string): Promise<void> {
    try {
      // Извлекаем ID или путь из URL для удаления
      const urlParts = imageUrl.split('/');
      const imageId = urlParts[urlParts.length - 1];
      
      await firstValueFrom(
        this.httpService.delete(`${this.imageServiceUrl}/images/${imageId}`)
      );
    } catch (error) {
      console.warn(`Failed to delete from external service: ${error.message}`);
      // Не выбрасываем ошибку, чтобы не прерывать удаление из БД
    }
  }

  getFullImageUrl(link: string): string {
    // Если ссылка уже полная (содержит http/https), возвращаем как есть
    if (link.startsWith('http://') || link.startsWith('https://')) {
      return link;
    }
    
    // Для всех относительных ссылок используем локальный сервис
    return `${this.imageServiceUrl}${link.startsWith('/') ? link : '/' + link}`;
  }
} 