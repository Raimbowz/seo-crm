import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead, LeadStatus } from './entities/lead.entity';
import { Request } from 'express';
import axios from 'axios';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const lead = this.leadRepository.create({
      ...createLeadDto,
      status: createLeadDto.status ? (createLeadDto.status as LeadStatus) : LeadStatus.NEW,
    });
    return await this.leadRepository.save(lead);
  }

  async findAll(): Promise<Lead[]> {
    return await this.leadRepository.find();
  }

  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadRepository.findOne({ where: { id } });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findOne(id);
    const updatedLead = {
      ...lead,
      ...updateLeadDto,
      status: updateLeadDto.status ? (updateLeadDto.status as LeadStatus) : lead.status,
    };
    return await this.leadRepository.save(updatedLead);
  }

  async remove(id: string): Promise<void> {
    const lead = await this.findOne(id);
    await this.leadRepository.remove(lead);
  }

  async submitForm(formData: any, req: Request): Promise<{ success: boolean; message: string; leadId?: string }> {
    try {
      // Extract IP address from request
      const ip = this.extractClientIP(req);
      
      // Get geolocation data
      let countryCode = '';
      try {
        if (ip) {
          const response = await axios.get(`https://vanadotrade.com/lead/api/ip?ip=${ip}`);
          countryCode = response.data.geo?.country_code || '';
        }
      } catch (error) {
        console.warn('Failed to get IP geolocation:', error.message);
      }

      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        throw new BadRequestException('Missing required fields: firstName, lastName, email, phone');
      }

      // Create lead DTO
      const createLeadDto: CreateLeadDto = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        company: formData.company?.trim() || '',
        source: formData.source || 'website_form',
        notes: formData.message?.trim() || '',
        ip: ip,
        countryCode: countryCode,
        userAgent: req.headers['user-agent'] || '',
        locale: formData.locale || 'en-US',
        referer: req.headers.referer || '',
        formData: {
          ...formData,
          submittedAt: new Date().toISOString(),
          page: formData.page || '',
          utmSource: formData.utm_source || '',
          utmMedium: formData.utm_medium || '',
          utmCampaign: formData.utm_campaign || '',
          utmTerm: formData.utm_term || '',
          utmContent: formData.utm_content || ''
        }
      };

      // Create the lead
      const lead = await this.create(createLeadDto);

      return {
        success: true,
        message: 'Form submitted successfully',
        leadId: lead.id
      };

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      console.error('Error submitting form:', error);
      throw new BadRequestException('Failed to submit form');
    }
  }

  private extractClientIP(req: Request): string {
    // Try various headers to get the real client IP
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const cfConnectingIP = req.headers['cf-connecting-ip'];
    
    if (typeof forwarded === 'string') {
      // X-Forwarded-For can contain multiple IPs, take the first one
      return forwarded.split(',')[0].trim();
    }
    
    if (typeof realIP === 'string') {
      return realIP;
    }
    
    if (typeof cfConnectingIP === 'string') {
      return cfConnectingIP;
    }
    
    // Fallback to connection remote address
    return req.socket.remoteAddress || req.ip || '';
  }
}
