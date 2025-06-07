import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
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

  async findAll(): Promise<Image[]> {
    return this.imageRepository.find();
  }

  async findOne(id: number): Promise<Image> {
    const image = await this.imageRepository.findOne({ where: { id } });
    if (!image) throw new NotFoundException('Image not found');
    return image;
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

  async uploadToExternalService(buffer: Buffer, filename: string): Promise<string> {
    try {
      const formData = new FormData();
      const blob = new Blob([buffer]);
      formData.append('file', blob, filename);

      const response = await firstValueFrom(
        this.httpService.post(`${this.imageServiceUrl}/images/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );

      // Локальный сервис возвращает { imageId, urls: { processed: "/images/imageId" } }
      return response.data.urls.processed;
    } catch (error) {
      throw new Error(`Failed to upload to external service: ${error.message}`);
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
    
    // Иначе строим полную ссылку через локальный сервис
    return `${this.imageServiceUrl}${link.startsWith('/') ? '' : '/'}${link}`;
  }
} 