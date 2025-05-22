import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
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
    return this.imagesService.create(createImageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all images' })
  @ApiResponse({ status: 200, type: [Image], description: 'Array of images' })
  findAll(): Promise<Image[]> {
    return this.imagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get image by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: Image, description: 'Image by id' })
  findOne(@Param('id') id: string): Promise<Image> {
    return this.imagesService.findOne(Number(id));
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
  @ApiOperation({ summary: 'Upload image file (fastify)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, schema: { example: { url: '/images/static/filename.jpg' } }, description: 'Uploaded file url' })
  async uploadFile(@Req() req: FastifyRequest) {
    // @fastify/multipart required
    // @ts-ignore
    const parts = req.parts();
    let fileUrl = '';
    for await (const part of parts) {
      if (part.type === 'file') {
        const ext = path.extname(part.filename);
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
        const saveTo = path.join(uploadPath, unique);
        await new Promise<void>((resolve, reject) => {
          const ws = fs.createWriteStream(saveTo);
          part.file.pipe(ws);
          ws.on('finish', () => resolve());
          ws.on('error', (err) => reject(err));
          part.file.on('error', (err) => reject(err));
        });
        fileUrl = `/images/static/${unique}`;
        break;
      }
    }
    if (!fileUrl) throw new Error('No file uploaded');
    return {
      url: fileUrl,
    };
  }
} 