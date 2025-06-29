import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Site } from './entities/site.entity';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SiteAccess } from '../site-access/entities/site-access.entity';
import { PagesService } from '../pages/pages.service';
import { TemplatesService } from '../templates/templates.service';
import { BlocksService } from '../blocks/blocks.service';
import { VariablesService } from '../variables/variables.service';
import { CitiesService } from '../cities/cities.service';
import { VariableReplacementService } from '../common/services/variable-replacement.service';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    @InjectRepository(SiteAccess)
    private readonly siteAccessRepository: Repository<SiteAccess>,
    private readonly pagesService: PagesService,
    private readonly templatesService: TemplatesService,
    private readonly blocksService: BlocksService,
    private readonly variablesService: VariablesService,
    private readonly citiesService: CitiesService,
    private readonly variableReplacementService: VariableReplacementService,
  ) {}

  async create(dto: CreateSiteDto) {
    const site = this.siteRepository.create(dto);
    return await this.siteRepository.save(site);
  }

  async findAll() {
    return await this.siteRepository.find();
  }

  async findAllByUser(userId: number, userRole: string) {
    if (userRole === 'creator') return await this.siteRepository.find();
    const access = await this.siteAccessRepository.find({ where: { userId } });
    const siteIds = access.map(a => a.siteId);
    if (!siteIds.length) return [];
    return await this.siteRepository.find({ where: { id: In(siteIds) } });
  }

  async findOne(id: number) {
    return await this.siteRepository.findOneBy({ id });
  }

  async update(id: number, dto: UpdateSiteDto) {
    return await this.siteRepository.update(id, dto);
  }

  async remove(id: number) {
    return await this.siteRepository.delete(id);
  }

  async findOneWithPagesAndTemplatesAndBlocks(id: number | string) {
    const site = typeof id === 'number' ? await this.siteRepository.findOneBy({ id }) : await this.siteRepository.findOneBy({ domain: id });
    console.log('site:', site,'id:',id);
    if (!site) return null;

    // Получаем все страницы этого сайта
    const pages = await this.pagesService.findBySiteId(site.id);

    // Получаем все активные переменные
    const variablesArr = await this.variablesService.getAllVariables();
    const variables: Record<string, string> = {};
    for (const v of variablesArr) {
      if (v.isActive) variables[v.key] = v.value;
    }

    // Собираем все blockIds по всем страницам/шаблонам
    const allBlockIds: number[] = [];
    const pageTemplateContents: { pageIdx: number, template: any, content: any }[] = [];

    pages.forEach((page, pageIdx) => {
      if (page.template && page.template.content) {
        try {
          const content = JSON.parse(page.template.content);
          pageTemplateContents.push({ pageIdx, template: page.template, content });
          const ids = extractBlockIdsFromContent(content);
          allBlockIds.push(...ids);
        } catch {}
      }
    });

    // Получаем все блоки одним запросом
    const uniqueBlockIds = Array.from(new Set(allBlockIds));
    const blocks = uniqueBlockIds.length ? await this.blocksService.findByIds(uniqueBlockIds) : [];
    const blockMap = new Map<number, any>();
    blocks.forEach(b => blockMap.set(b.id, b));

    // Вставляем контент блока в каждый блок шаблона
    for (const { template, content } of pageTemplateContents) {
      if (Array.isArray(content)) {
        for (const row of content) {
          if (row.columns && Array.isArray(row.columns)) {
            for (const col of row.columns) {
              if (col.blocks && Array.isArray(col.blocks)) {
                for (const block of col.blocks) {
                  if (block.value) {
                    const id = Number(block.value);
                    if (!isNaN(id) && blockMap.has(id)) {
                      const blockData = { ...blockMap.get(id) };
                      // Преобразуем blockContent.content в объект, если это строка и это JSON
                      if (blockData.content && typeof blockData.content === 'string') {
                        try {
                          blockData.content = JSON.parse(blockData.content);
                        } catch {}
                      }
                      block.blockContent = blockData;
                    }
                  }
                }
              }
            }
          }
        }
      }
      // template.content теперь объект, а не строка
      template.content = content;
    }

    // Формируем финальный ответ с заменой переменных
    const pagesWithTemplates: any[] = [];
    for (const page of pages) {
      // Получаем город для страницы (или Москву)
      const city = await this.getCityOrDefault(page.cityId);
      // Заменяем переменные во всех строках страницы
      let pageWithVars = parseAllStrings(page, variables, city, site);
      // Дополнительно обрабатываем системные переменные через новый сервис
      pageWithVars = this.variableReplacementService.replaceVariables(pageWithVars);
      // Заменяем переменные в шаблоне (template.content)
      if (pageWithVars.template && pageWithVars.template.content) {
        pageWithVars.template.content = replaceVariablesInContent(pageWithVars.template.content, variables, city, site);
        // Дополнительно обрабатываем системные переменные через новый сервис
        pageWithVars.template.content = this.variableReplacementService.replaceVariables(pageWithVars.template.content);
      }
      // Заменяем переменные в блоках (blockContent)
      if (pageWithVars.template && Array.isArray(pageWithVars.template.content)) {
        for (const row of pageWithVars.template.content) {
          if (row.columns && Array.isArray(row.columns)) {
            for (const col of row.columns) {
              if (col.blocks && Array.isArray(col.blocks)) {
                for (const block of col.blocks) {
                  if (block.blockContent && block.blockContent.content) {
                    block.blockContent.content = replaceVariablesInContent(block.blockContent.content, variables, city, site);
                    // Дополнительно обрабатываем системные переменные через новый сервис
                    block.blockContent.content = this.variableReplacementService.replaceVariables(block.blockContent.content);
                  }
                }
              }
            }
          }
        }
      }
      pagesWithTemplates.push(pageWithVars);
    }

    // Парсим все строки у сайта
    let siteWithVars = parseAllStrings(site, variables, null, site);
    // Дополнительно обрабатываем системные переменные через новый сервис
    siteWithVars = this.variableReplacementService.replaceVariables(siteWithVars);
    siteWithVars.pages = pagesWithTemplates;
    return siteWithVars;
  }

  // Получить город по id или город "Москва" по умолчанию
  private async getCityOrDefault(cityId?: number) {
    if (cityId) {
      try {
        const city = await this.citiesService.findOne(cityId);
        if (city) return city;
      } catch {}
    }
    // Если не найден — ищем Москву
    const cities = await this.citiesService.findByName('Москва');
    return cities && cities.length ? cities[0] : null;
  }
}

// Вынесенная функция для извлечения id блоков из структуры content шаблона
function extractBlockIdsFromContent(content: any): number[] {
  // content — массив строк (строки — строки шаблона)
  // В каждой строке есть columns, в columns — blocks, у блока value — id блока (строкой или числом)
  const ids: number[] = [];
  if (Array.isArray(content)) {
    for (const row of content) {
      if (row.columns && Array.isArray(row.columns)) {
        for (const col of row.columns) {
          if (col.blocks && Array.isArray(col.blocks)) {
            for (const block of col.blocks) {
              if (block.value) {
                const id = Number(block.value);
                if (!isNaN(id)) ids.push(id);
              }
            }
          }
        }
      }
    }
  }
  return ids;
}

// Рекурсивная функция для замены переменных в любом контенте
function replaceVariablesInContent(content: any, variables: Record<string, string>, city: any, site?: any): any {
  if (typeof content === 'string') {
    // Заменяем [*var*] на значения из variables, города и сайта
    return content.replace(/\[\*(.*?)\*\]/g, (match, varName) => {
      varName = varName.trim();
      if (variables[varName] !== undefined) return variables[varName];
      // Системные переменные для города
      if (city) {
        if (varName.startsWith('city_')) {
          const field =
            varName === 'city' ? 'name' :
            varName === 'city_genetive' ? 'nameGenitive' :
            varName === 'city_dative' ? 'nameDative' :
            varName === 'city_accusative' ? 'nameAccusative' :
            varName === 'city_instrumental' ? 'nameInstrumental' :
            varName === 'city_prepositional' ? 'namePrepositional' : null;
          if (field && city[field]) return city[field];
        }
      }
      // Системная переменная module_sites_entity_name
      if (site && varName === 'site_name') {
        return site.name || '';
      }
      return match; // если не нашли — не заменяем
    });
  } else if (Array.isArray(content)) {
    return content.map(item => replaceVariablesInContent(item, variables, city, site));
  } else if (typeof content === 'object' && content !== null) {
    const result: any = {};
    for (const key of Object.keys(content)) {
      result[key] = replaceVariablesInContent(content[key], variables, city, site);
    }
    return result;
  }
  return content;
}

// Рекурсивно парсит все строки в объекте через replaceVariablesInContent
function parseAllStrings(obj: any, variables: Record<string, string>, city: any, site: any): any {
  if (typeof obj === 'string') {
    return replaceVariablesInContent(obj, variables, city, site);
  } else if (Array.isArray(obj)) {
    return obj.map(item => parseAllStrings(item, variables, city, site));
  } else if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = parseAllStrings(obj[key], variables, city, site);
    }
    return result;
  }
  return obj;
} 