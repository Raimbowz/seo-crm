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

  async sendLeadToPartner(partner: Partner, leadData: any): Promise<boolean> {
    try {
      // Parse field mapping
      const fieldMapping = JSON.parse(partner.fieldMapping);
      const apiHeaders = partner.apiHeaders ? JSON.parse(partner.apiHeaders) : {};
      
      // Map lead data to partner format
      const mappedData: any = {};
      
      for (const [leadField, partnerField] of Object.entries(fieldMapping)) {
        let value = leadData[leadField];
        
        // Handle nested fields like formData.firstName
        if (!value && leadData.formData && leadData.formData[leadField]) {
          value = leadData.formData[leadField];
        }
        
        if (value !== undefined && value !== null) {
          // Handle nested partner fields like profile[phone]
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
          } else {
            mappedData[partnerField] = value;
          }
        }
      }

      this.logger.log(`Sending lead to partner ${partner.name}: ${partner.apiUrl}`);
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
      let response;
      if (partner.apiMethod.toUpperCase() === 'GET') {
        // For GET requests, send data as query params
        response = await firstValueFrom(
          this.httpService.get(partner.apiUrl, {
            ...config,
            params: mappedData,
          })
        );
      } else {
        // For POST/PUT/PATCH, send data in body
        response = await firstValueFrom(
          this.httpService.request({
            method: partner.apiMethod.toUpperCase(),
            url: partner.apiUrl,
            data: mappedData,
            ...config,
          })
        );
      }

      this.logger.log(`Successfully sent lead to partner ${partner.name}. Status: ${response.status}`);
      return true;

    } catch (error) {
      this.logger.error(`Failed to send lead to partner ${partner.name}:`, error.message);
      if (error.response) {
        this.logger.error('Response data:', error.response.data);
      }
      return false;
    }
  }
}
