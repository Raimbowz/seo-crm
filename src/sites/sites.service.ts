import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Site } from './entities/site.entity';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { CloneSiteDto } from './dto/clone-site.dto';
import { SiteAccess } from '../site-access/entities/site-access.entity';
import { PagesService } from '../pages/pages.service';
import { TemplatesService } from '../templates/templates.service';
import { BlocksService } from '../blocks/blocks.service';
import { VariablesService } from '../variables/variables.service';
import { CitiesService } from '../cities/cities.service';
import { VariableReplacementService } from '../common/services/variable-replacement.service';
import { ImagesService } from '../images/images.service';

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
    private readonly imagesService: ImagesService,
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
    const siteIds = access.map((a) => a.siteId);
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

  async clone(id: number, dto: CloneSiteDto, userId: number) {
    try {
      console.log('Starting site clone:', { id, dto, userId });
      
      // Получаем исходный сайт со всеми данными
      const originalSite = await this.siteRepository.findOneBy({ id });
      if (!originalSite) {
        throw new Error('Site not found');
      }

      // Создаем новый сайт
      const currentDate = new Date().toISOString().split('T')[0];
      const newSite = this.siteRepository.create({
        ...originalSite,
        id: undefined,
        name: dto.name,
        url: dto.url,
        domain: dto.domain,
        description: dto.description || `${originalSite.description} - Копия от ${currentDate}`,
        ownerId: userId,
        createdAt: undefined,
        updatedAt: undefined,
      });

      const savedSite = await this.siteRepository.save(newSite);

      // Копируем переменные сайта
      if (dto.copyVariables !== false) {
        const siteVariables = await this.variablesService.findBySiteId(id);
        for (const variable of siteVariables) {
          // Делаем ключ уникальным добавляя дату для избежания конфликтов
          const uniqueKey = `${variable.key}_copy_${currentDate.replace(/-/g, '')}`;
          await this.variablesService.createVariable({
            name: variable.name,
            key: uniqueKey,
            value: variable.value,
            comment: variable.comment,
            siteId: savedSite.id,
            isActive: variable.isActive,
          });
        }
      }

      // Копируем изображения (только записи в БД, не глобальные)
      if (dto.copyImages !== false) {
        const siteImages = await this.imagesService.findAll(id, false);
        for (const image of siteImages) {
          if (!image.isGlobal) {
            await this.imagesService.create({
              name: `${image.name} - Копия ${currentDate}`,
              link: image.link,
              group: image.group,
              userId: userId,
              siteId: savedSite.id,
              isGlobal: false,
              isPublic: image.isPublic,
              isActive: image.isActive,
            });
          }
        }
      }

      // Получаем все страницы исходного сайта
      const originalPages = await this.pagesService.findBySiteId(id);
      const pageMapping = new Map<number, number>(); // старый ID -> новый ID
      
      // Копируем страницы
      for (const originalPage of originalPages) {
        const newPage = await this.pagesService.create({
          title: originalPage.title,
          slug: `${originalPage.slug}-copy-${currentDate}`,
          metaDescription: originalPage.metaDescription,
          metaKeywords: originalPage.metaKeywords,
          cityId: originalPage.cityId,
          siteId: savedSite.id,
          templateId: 'temp', // временный ID, будет обновлен позже
          partnerId: originalPage.partnerId,
          isActive: originalPage.isActive,
          isMain: false, // копии не могут быть главными страницами
          parentId: originalPage.parentId,
          isGlobal: false,
          isThankYouPage: originalPage.isThankYouPage,
        });
        pageMapping.set(originalPage.id, newPage.id);
      }

      // Копируем шаблоны и блоки
      const blockMapping = new Map<number, number>(); // старый ID -> новый ID
      
      for (const originalPage of originalPages) {
        if (originalPage.template) {
          // Копируем все блоки из шаблона
          const templateContent = JSON.parse(originalPage.template.content || '[]');
          const blockIds = extractBlockIdsFromContent(templateContent);
          
          for (const blockId of blockIds) {
            if (!blockMapping.has(blockId)) {
              const originalBlock = await this.blocksService.findOne(blockId);
              if (originalBlock) {
                const newBlock = await this.blocksService.create({
                  name: `${originalBlock.name} - Копия ${currentDate}`,
                  type: originalBlock.type,
                  content: originalBlock.content,
                  isGlobal: false, // копии блоков не глобальные
                });
                blockMapping.set(blockId, newBlock.id);
              }
            }
          }

          // Обновляем content шаблона с новыми ID блоков
          const updatedContent = this.updateBlockIdsInContent(templateContent, blockMapping);
          
          // Создаем новый шаблон
          const newTemplate = await this.templatesService.create({
            name: `${originalPage.template.name} - Копия ${currentDate}`,
            description: originalPage.template.description,
            content: JSON.stringify(updatedContent),
            type: originalPage.template.type,
            siteId: savedSite.id,
            isActive: originalPage.template.isActive,
            isGlobal: false, // копии шаблонов не глобальные
          });

          // Обновляем страницу с новым шаблоном
          const newPageId = pageMapping.get(originalPage.id);
          if (newPageId) {
            await this.pagesService.update(newPageId, {
              templateId: newTemplate.id,
            });
          }
        }
      }

      return savedSite;
    } catch (error) {
      console.error('Clone site error:', error);
      throw error;
    }
  }

  private updateBlockIdsInContent(content: any, blockMapping: Map<number, number>): any {
    if (Array.isArray(content)) {
      return content.map(row => {
        if (row.columns && Array.isArray(row.columns)) {
          return {
            ...row,
            columns: row.columns.map(col => {
              if (col.blocks && Array.isArray(col.blocks)) {
                return {
                  ...col,
                  blocks: col.blocks.map(block => {
                    if (block.value) {
                      const oldId = Number(block.value);
                      const newId = blockMapping.get(oldId);
                      return {
                        ...block,
                        value: newId ? newId.toString() : block.value,
                      };
                    }
                    return block;
                  }),
                };
              }
              return col;
            }),
          };
        }
        return row;
      });
    }
    return content;
  }

  async findOneWithPagesAndTemplatesAndBlocks(id: number | string) {
    const site =
      typeof id === 'number'
        ? await this.siteRepository.findOneBy({ id })
        : await this.siteRepository.findOneBy({ domain: id });
    console.log('site:', site, 'id:', id);
    if (!site) return null;

    // Получаем все страницы этого сайта
    const pages = await this.pagesService.findBySiteId(site.id);

    // Получаем все активные переменные для данного сайта
    const variablesArr = await this.variablesService.findBySiteId(site.id);
    const variables: Record<string, string> = {};
    for (const v of variablesArr) {
      if (v.isActive) {
        // Убираем скобки из ключа если они есть
        const cleanKey = v.key.replace(/^\[\*|\*\]$/g, '');
        variables[cleanKey] = v.value;
      }
    }
    // Также получаем глобальные переменные (с siteId = null)
    const globalVariablesArr = await this.variablesService.getAllVariables();
    for (const v of globalVariablesArr) {
      if (v.isActive && !v.siteId) {
        // Убираем скобки из ключа если они есть
        const cleanKey = v.key.replace(/^\[\*|\*\]$/g, '');
        if (!variables[cleanKey]) {
          variables[cleanKey] = v.value;
        }
      }
    }

    // Собираем все blockIds по всем страницам/шаблонам
    const allBlockIds: number[] = [];
    const pageTemplateContents: {
      pageIdx: number;
      template: any;
      content: any;
    }[] = [];

    pages.forEach((page, pageIdx) => {
      if (page.template && page.template.content) {
        try {
          const content = JSON.parse(page.template.content);
          pageTemplateContents.push({
            pageIdx,
            template: page.template,
            content,
          });
          const ids = extractBlockIdsFromContent(content);
          allBlockIds.push(...ids);
        } catch {}
      }
    });

    // Получаем все блоки одним запросом
    const uniqueBlockIds = Array.from(new Set(allBlockIds));
    const blocks = uniqueBlockIds.length
      ? await this.blocksService.findByIds(uniqueBlockIds)
      : [];
    const blockMap = new Map<number, any>();
    blocks.forEach((b) => blockMap.set(b.id, b));

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
                      if (
                        blockData.content &&
                        typeof blockData.content === 'string'
                      ) {
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

    // Собираем все переменные включая системные и город
    const allVariables = { ...variables };
    
    // Формируем финальный ответ с заменой переменных
    const pagesWithTemplates: any[] = [];
    for (const page of pages) {
      // Получаем город для страницы (или Москву)
      const city = await this.getCityOrDefault(page.cityId);
      
      // Добавляем городские переменные
      const pageVariables = { ...allVariables };
      if (city) {
        pageVariables['city'] = city.name || '';
        pageVariables['city_genetive'] = city.nameGenitive || '';
        pageVariables['city_dative'] = city.nameDative || '';
        pageVariables['city_accusative'] = city.nameAccusative || '';
        pageVariables['city_instrumental'] = city.nameInstrumental || '';
        pageVariables['city_prepositional'] = city.namePrepositional || '';
      }
      
      // Добавляем переменные сайта
      if (site) {
        pageVariables['site_name'] = site.name || '';
      }
      
      // Заменяем переменные через новый сервис
      let pageWithVars = await this.variableReplacementService.replaceVariables(
        page,
        'ru-RU',
        pageVariables,
      );
      
      pagesWithTemplates.push(pageWithVars);
    }

    // Добавляем переменные сайта для замены в самом объекте сайта
    const siteVariables = { ...allVariables };
    if (site) {
      siteVariables['site_name'] = site.name || '';
    }
    
    // Заменяем переменные в объекте сайта через новый сервис
    let siteWithVars = await this.variableReplacementService.replaceVariables(
      site,
      'ru-RU',
      siteVariables,
    );
    
    // Добавляем все переменные в объект сайта для доступа в Handlebars templates
    siteWithVars.variables = siteVariables;
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

