import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Partner } from './entities/partner.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { Site } from '../sites/entities/site.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface FieldMapping {
  type: 'field' | 'constant';
  localField?: string;
  constantValue?: any;
  partnerField: string;
}

@Injectable()
export class PartnersService {
  private readonly logger = new Logger(PartnersService.name);

  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    private readonly httpService: HttpService,
  ) {}

  async create(createPartnerDto: CreatePartnerDto): Promise<Partner> {
    // Check if a partner with the same email already exists
    const existingPartner = await this.partnerRepository.findOne({
      where: { email: createPartnerDto.email },
    });

    if (existingPartner) {
      throw new BadRequestException('Partner with this email already exists');
    }

    // Validate field mapping JSON
    try {
      JSON.parse(createPartnerDto.fieldMapping);
    } catch (error) {
      throw new BadRequestException('Invalid field mapping JSON format');
    }

    // Validate API headers JSON if provided
    if (createPartnerDto.apiHeaders) {
      try {
        JSON.parse(createPartnerDto.apiHeaders);
      } catch (error) {
        throw new BadRequestException('Invalid API headers JSON format');
      }
    }

    const { siteIds, ...partnerData } = createPartnerDto;
    const partner = this.partnerRepository.create(partnerData);

    // Handle site connections
    if (siteIds && siteIds.length > 0) {
      const sites = await this.siteRepository.find({
        where: { id: In(siteIds) },
      });
      partner.sites = sites;
    }

    return this.partnerRepository.save(partner);
  }

  async findAll(): Promise<Partner[]> {
    return this.partnerRepository.find({
      relations: ['sites'],
    });
  }

  async findOne(id: number): Promise<Partner> {
    const partner = await this.partnerRepository.findOne({
      where: { id },
      relations: ['sites'],
    });

    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }

    return partner;
  }

  async findBySiteId(siteId: number): Promise<Partner[]> {
    return this.partnerRepository
      .createQueryBuilder('partner')
      .innerJoin('partner.sites', 'site')
      .where('site.id = :siteId', { siteId })
      .andWhere('partner.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async update(
    id: number,
    updatePartnerDto: UpdatePartnerDto,
  ): Promise<Partner> {
    const partner = await this.findOne(id);

    // If email is being updated, check it's not already taken
    if (updatePartnerDto.email && updatePartnerDto.email !== partner.email) {
      const existingPartner = await this.partnerRepository.findOne({
        where: { email: updatePartnerDto.email },
      });

      if (existingPartner) {
        throw new BadRequestException('Partner with this email already exists');
      }
    }

    // Validate field mapping JSON if provided
    if (updatePartnerDto.fieldMapping) {
      try {
        JSON.parse(updatePartnerDto.fieldMapping);
      } catch (error) {
        throw new BadRequestException('Invalid field mapping JSON format');
      }
    }

    // Validate API headers JSON if provided
    if (updatePartnerDto.apiHeaders) {
      try {
        JSON.parse(updatePartnerDto.apiHeaders);
      } catch (error) {
        throw new BadRequestException('Invalid API headers JSON format');
      }
    }

    const { siteIds, ...partnerData } = updatePartnerDto;

    // Handle site connections update
    if (siteIds !== undefined) {
      if (siteIds.length > 0) {
        const sites = await this.siteRepository.find({
          where: { id: In(siteIds) },
        });
        partner.sites = sites;
      } else {
        partner.sites = [];
      }
    }

    this.partnerRepository.merge(partner, partnerData);
    return this.partnerRepository.save(partner);
  }

  async remove(id: number): Promise<void> {
    const partner = await this.findOne(id);
    await this.partnerRepository.remove(partner);
  }

  async sendLeadToPartner(partner: Partner, leadData: any): Promise<{ success: boolean; error?: string; statusCode?: number; message?: string }> {
    try {
      // Parse field mapping
      const fieldMapping = JSON.parse(partner.fieldMapping);
      const apiHeaders = partner.apiHeaders
        ? JSON.parse(partner.apiHeaders)
        : {};

      // Map lead data to partner format
      const mappedData: any = {};

      for (const [key, mapping] of Object.entries(fieldMapping)) {
        // Handle both new format (with type/constantValue) and legacy format
        let partnerField: string;
        let value: any;

        if (typeof mapping === 'object' && mapping !== null && (mapping as FieldMapping).type) {
          // New format with type/constantValue support
          const typedMapping = mapping as FieldMapping;
          partnerField = typedMapping.partnerField;
          
          if (typedMapping.type === 'constant') {
            // Use constant value
            value = typedMapping.constantValue;
          } else {
            // Use field mapping
            value = typedMapping.localField ? leadData[typedMapping.localField] : null;
            
            // Handle nested fields like formData.firstName
            if (!value && leadData.formData && typedMapping.localField && leadData.formData[typedMapping.localField]) {
              value = leadData.formData[typedMapping.localField];
            }
          }
        } else {
          // Legacy format - simple localField -> partnerField mapping
          partnerField = String(mapping);
          value = leadData[key];
          
          // Handle nested fields like formData.firstName
          if (!value && leadData.formData && leadData.formData[key]) {
            value = leadData.formData[key];
          }
        }

        if (value !== undefined && value !== null && value !== '') {
          // Handle nested partner fields like profile[phone] or data.email
          if (partnerField.includes('[') && partnerField.includes(']')) {
            const matches = partnerField.match(/^([^[]+)\[([^\]]+)\]$/);
            if (matches) {
              const [, parentKey, childKey] = matches;
              if (!mappedData[parentKey]) {
                mappedData[parentKey] = {};
              }
              mappedData[parentKey][childKey] = value;
            } else {
              mappedData[partnerField] = value;
            }
          } else if (partnerField.includes('.')) {
            const [parentKey, childKey] = partnerField.split('.');
            if (!mappedData[parentKey]) {
              mappedData[parentKey] = {};
            }
            mappedData[parentKey][childKey] = value;
          } else {
            mappedData[partnerField] = value;
          }
        }
      }

      this.logger.log(
        `Sending lead to partner ${partner.name}: ${partner.apiUrl}`,
      );
      this.logger.debug('Mapped data:', mappedData);

      // Prepare request config
      const config: any = {
        headers: {
          'Content-Type': 'application/json',
          ...apiHeaders,
        },
        timeout: 10000, // 10 seconds timeout
      };

      // Make API request
      let response: any;
      if (partner.apiMethod.toUpperCase() === 'GET') {
        // For GET requests, send data as query params
        response = await firstValueFrom(
          this.httpService.get(partner.apiUrl, {
            ...config,
            params: mappedData,
          }),
        );
      } else {
        // For POST/PUT/PATCH, send data in body
        response = await firstValueFrom(
          this.httpService.request({
            method: partner.apiMethod.toUpperCase(),
            url: partner.apiUrl,
            data: mappedData,
            ...config,
          }),
        );
      }

      this.logger.log(
        `Successfully sent lead to partner ${partner.name}. Status: ${response.status}`,
      );
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to send lead to partner ${partner.name}:`,
        error.message,
      );
      
      if (error.response) {
        const statusCode = error.response.status;
        const responseData = error.response.data;
        this.logger.error('Response data:', responseData);
        
        // Определяем тип ошибки по статус коду
        if (statusCode === 422) {
          const message = responseData?.message || 'Validation error';
          this.logger.warn(`❌ Validation error from partner ${partner.name}: ${message}`);
          return { success: false, error: 'validation', statusCode, message };
        } else if (statusCode >= 400 && statusCode < 500) {
          const message = responseData?.message || 'Client error';
          this.logger.warn(`❌ Client error from partner ${partner.name}: ${message}`);
          return { success: false, error: 'client', statusCode, message };
        } else if (statusCode >= 500) {
          const message = responseData?.message || 'Server error';
          this.logger.warn(`❌ Server error from partner ${partner.name}: ${message}`);
          return { success: false, error: 'server', statusCode, message };
        }
      } else {
        this.logger.error(`❌ Network or timeout error for partner ${partner.name}`);
        return { success: false, error: 'network', message: error.message };
      }
      
      return { success: false, error: 'unknown', message: error.message };
    }
  }
}
