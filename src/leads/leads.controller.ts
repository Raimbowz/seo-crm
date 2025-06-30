import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({
    status: 201,
    description: 'Lead has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit a form lead (public endpoint)' })
  @ApiResponse({
    status: 200,
    description: 'Lead has been successfully submitted.',
  })
  @ApiResponse({
    status: 302,
    description: 'Lead submitted successfully, redirecting to thank you page.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async submitForm(@Body() formData: any, @Req() req: Request, @Res() res: Response) {
    const result = await this.leadsService.submitForm(formData, req);
    
    if (result.redirectUrl) {
      // If we have a redirect URL, perform a redirect
      return res.redirect(302, result.redirectUrl);
    } else {
      // Otherwise return JSON response using Fastify syntax
      return res.status(HttpStatus.OK).send(result);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all leads' })
  @ApiResponse({ status: 200, description: 'Return all leads.' })
  findAll() {
    return this.leadsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a lead by id' })
  @ApiResponse({ status: 200, description: 'Return the lead.' })
  @ApiResponse({ status: 404, description: 'Lead not found.' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a lead' })
  @ApiResponse({
    status: 200,
    description: 'Lead has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Lead not found.' })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a lead' })
  @ApiResponse({
    status: 200,
    description: 'Lead has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Lead not found.' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
