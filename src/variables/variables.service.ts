import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Variable } from './entities/variable.entity';
import { CreateVariableDto } from './dto/create-variable.dto';
import { UpdateVariableDto } from './dto/update-variable.dto';

@Injectable()
export class VariablesService {
  constructor(
    @InjectRepository(Variable)
    private readonly variableRepository: Repository<Variable>,
  ) {}

  async createVariable(createVariableDto: CreateVariableDto): Promise<Variable> {
    const exists = await this.variableRepository.findOne({ where: { key: createVariableDto.key } });
    if (exists) throw new BadRequestException('Variable with this key already exists');
    const variable = this.variableRepository.create(createVariableDto);
    return this.variableRepository.save(variable);
  }

  async getAllVariables(): Promise<Variable[]> {
    return this.variableRepository.find();
  }

  async findBySiteId(siteId: number): Promise<Variable[]> {
    return this.variableRepository.find({ 
      where: { siteId },
      order: { createdAt: 'ASC' }
    });
  }

  async getVariableById(id: number): Promise<Variable> {
    const variable = await this.variableRepository.findOne({ where: { id } });
    if (!variable) throw new NotFoundException('Variable not found');
    return variable;
  }

  async updateVariable(id: number, updateVariableDto: UpdateVariableDto): Promise<Variable> {
    const variable = await this.getVariableById(id);
    Object.assign(variable, updateVariableDto);
    return this.variableRepository.save(variable);
  }

  async deleteVariable(id: number): Promise<void> {
    const variable = await this.getVariableById(id);
    await this.variableRepository.remove(variable);
  }

  /**
   * Парсит текст, заменяя {{KEY}} на значение переменной
   */
  async parseText(text: string): Promise<string> {
    const variables = await this.variableRepository.find({ where: { isActive: true } });
    let parsed = text;
    for (const variable of variables) {
      parsed = parsed.replace(new RegExp(`{{${variable.key}}}`, 'g'), variable.value);
    }
    return parsed;
  }
} 