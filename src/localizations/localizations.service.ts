import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Localization } from './entities/localization.entity';

@Injectable()
export class LocalizationsService {
  constructor(
    @InjectRepository(Localization)
    private readonly localizationRepository: Repository<Localization>,
  ) {}

  async create(data: Partial<Localization>): Promise<Localization> {
    return this.localizationRepository.save(data);
  }

  async findAll(): Promise<Localization[]> {
    return this.localizationRepository.find();
  }

  async update(id: number, data: Partial<Localization>) {
    await this.localizationRepository.update(id, data);
    return this.localizationRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.localizationRepository.delete(id);
  }
}
