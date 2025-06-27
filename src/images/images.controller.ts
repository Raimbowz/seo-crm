import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, Query } from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { Image } from './entities/image.entity';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { FastifyRequest } from 'fastify';

const uploadPath = path.resolve(__dirname, '../../files/images');

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create image record' })
  @ApiBody({ type: CreateImageDto })
  @ApiResponse({ status: 201, type: Image, description: 'Image created' })
  create(@Body() createImageDto: CreateImageDto): Promise<Image> {
    console.log('💾 Creating DB record:', createImageDto);
    return this.imagesService.create(createImageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all images' })
  @ApiResponse({ status: 200, type: [Image], description: 'Array of images' })
  async findAll(@Query('siteId') siteId?: string, @Query('includeGlobal') includeGlobal?: string): Promise<any[]> {
    const includeGlobalFlag = includeGlobal !== undefined ? includeGlobal === 'true' : true;
    const siteIdNumber = siteId ? Number(siteId) : undefined;
    
    console.log('Images query params:', { siteId: siteIdNumber, includeGlobal: includeGlobalFlag });
    
    const images = await this.imagesService.findAll(
      siteIdNumber,
      includeGlobalFlag
    );
    // Добавляем полные URL для каждого изображения
    return images.map(image => ({
      ...image,
      fullUrl: this.imagesService.getFullImageUrl(image.link),
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get image by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: Image, description: 'Image by id' })
  async findOne(@Param('id') id: string): Promise<any> {
    const image = await this.imagesService.findOne(Number(id));
    return {
      ...image,
      fullUrl: this.imagesService.getFullImageUrl(image.link),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update image by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateImageDto })
  @ApiResponse({ status: 200, type: Image, description: 'Updated image' })
  update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto): Promise<Image> {
    return this.imagesService.update(Number(id), updateImageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete image by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Image deleted' })
  remove(@Param('id') id: string): Promise<void> {
    return this.imagesService.remove(Number(id));
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload image file to image service (without DB record)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, schema: { example: { link: '/images/id.webp', url: '/images/id.webp', fullUrl: 'http://localhost:3100/images/id.webp' } }, description: 'Uploaded file info from image service' })
  async uploadFile(@Req() req: FastifyRequest) {
    console.log('🔥 Upload endpoint called - this should NOT create DB record');
    // @fastify/multipart required
    // @ts-ignore
    const parts = req.parts();
    let fileUrl = '';
    let filename = '';
    let uploadResult: any = null;
    
    for await (const part of parts) {
      if (part.type === 'file') {
        // Читаем файл в буфер
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        filename = part.filename || 'uploaded-image';
        
        // Загружаем на внешний сервис
        uploadResult = await this.imagesService.uploadToExternalService(buffer, filename);
        fileUrl = uploadResult.urls.processed;
        break;
      }
    }
    
    if (!fileUrl || !uploadResult) throw new Error('No file uploaded');
    
    // Возвращаем только информацию о файле без создания записи в БД
    // Запись в БД будет создана при сохранении формы
    return {
      link: fileUrl,
      url: fileUrl,
      fullUrl: this.imagesService.getFullImageUrl(fileUrl),
      format: uploadResult.format,
      originalFilename: uploadResult.originalFilename,
      filename: uploadResult.filename,
      size: uploadResult.size,
    };
  }
} 