import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LeadQueueService } from './lead-queue.service';
import { LeadQueue, LeadQueueStatus } from './entities/lead-queue.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Lead Queue')
@Controller('lead-queue')
@UseGuards(JwtAuthGuard)
export class LeadQueueController {
  constructor(private readonly leadQueueService: LeadQueueService) {}

  @Get()
  @ApiOperation({ summary: 'Get lead queue entries with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: LeadQueueStatus })
  @ApiQuery({ name: 'partnerId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lead queue entries retrieved successfully' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('status') status?: LeadQueueStatus,
    @Query('partnerId', new ParseIntPipe({ optional: true })) partnerId?: number,
  ) {
    return this.leadQueueService.findAll(page, limit, status, partnerId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get queue statistics' })
  @ApiResponse({ status: 200, description: 'Queue statistics retrieved successfully' })
  async getStats() {
    return this.leadQueueService.getQueueStats();
  }

  @Post('process')
  @ApiOperation({ summary: 'Manually trigger queue processing' })
  @ApiResponse({ status: 200, description: 'Queue processing triggered successfully' })
  async processQueue() {
    await this.leadQueueService.processQueue();
    return { message: 'Queue processing completed' };
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry a failed queue entry' })
  @ApiResponse({ status: 200, description: 'Queue entry rescheduled successfully' })
  async retryEntry(@Param('id', ParseIntPipe) id: number) {
    await this.leadQueueService.retryQueueEntry(id);
    return { message: 'Queue entry rescheduled for processing' };
  }
}