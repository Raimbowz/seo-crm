import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from './entities/partner.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
  ) {}

  async create(createPartnerDto: CreatePartnerDto): Promise<Partner> {
    // Check if a partner with the same email already exists
    const existingPartner = await this.partnerRepository.findOne({
      where: { email: createPartnerDto.email },
    });

    if (existingPartner) {
      throw new BadRequestException('Partner with this email already exists');
    }

    const partner = this.partnerRepository.create(createPartnerDto);
    return this.partnerRepository.save(partner);
  }

  async findAll(): Promise<Partner[]> {
    return this.partnerRepository.find({
      relations: ['pages'],
    });
  }

  async findOne(id: number): Promise<Partner> {
    const partner = await this.partnerRepository.findOne({
      where: { id },
      relations: ['pages'],
    });

    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }

    return partner;
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

    this.partnerRepository.merge(partner, updatePartnerDto);
    return this.partnerRepository.save(partner);
  }

  async remove(id: number): Promise<void> {
    const partner = await this.findOne(id);
    await this.partnerRepository.remove(partner);
  }
}
