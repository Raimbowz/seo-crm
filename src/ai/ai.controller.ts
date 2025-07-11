import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { TranslateBlockDto } from './dto/translate-block.dto';
import { TranslateBlockResponseDto } from './dto/translate-block-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('translate-block')
  async translateBlock(@Body() translateBlockDto: TranslateBlockDto): Promise<TranslateBlockResponseDto> {
    return this.aiService.translateBlock(translateBlockDto);
  }
}