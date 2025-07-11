import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { TranslateBlockDto } from './dto/translate-block.dto';
import { TranslateBlockResponseDto } from './dto/translate-block-response.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPEN_AI_KEY');
    if (!apiKey) {
      this.logger.error('OpenAI API key is not configured');
      throw new Error('OpenAI API key is required');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async translateBlock(data: TranslateBlockDto): Promise<TranslateBlockResponseDto> {
    try {
      this.logger.log(`Translating block from ${data.sourceLanguage} to ${data.targetLanguages.join(', ')}`);
      this.logger.log(`Block data structure: ${JSON.stringify(data.blockData, null, 2)}`);
      
      const sourceContent = this.extractTranslatableContent(data.blockData, data.sourceLanguage);
      this.logger.log(`Extracted source content: ${JSON.stringify(sourceContent, null, 2)}`);
      
      if (!sourceContent || Object.keys(sourceContent).length === 0) {
        this.logger.error(`No translatable content found for source language: ${data.sourceLanguage}`);
        return {
          success: false,
          translations: {},
          error: 'No translatable content found in source language'
        };
      }

      const translations: Record<string, any> = {};
      
      for (const targetLang of data.targetLanguages) {
        try {
          const translatedContent = await this.translateContent(sourceContent, data.sourceLanguage, targetLang);
          translations[targetLang] = translatedContent;
        } catch (error) {
          this.logger.error(`Failed to translate to ${targetLang}:`, error.message);
          translations[targetLang] = {
            error: `Translation failed: ${error.message}`
          };
        }
      }

      return {
        success: true,
        translations
      };
    } catch (error) {
      this.logger.error('Translation failed:', error);
      return {
        success: false,
        translations: {},
        error: error.message
      };
    }
  }

  private extractTranslatableContent(blockData: any, sourceLanguage: string): any {
    // Извлекаем контент для перевода из блока
    this.logger.log(`Looking for content in language: ${sourceLanguage}`);
    this.logger.log(`Available locales: ${blockData.locales ? Object.keys(blockData.locales) : 'none'}`);
    
    if (blockData.locales && blockData.locales[sourceLanguage]) {
      return blockData.locales[sourceLanguage];
    }
    
    // Альтернативный способ - проверяем прямо в корне блока
    if (blockData[sourceLanguage]) {
      return blockData[sourceLanguage];
    }
    
    return null;
  }

  private async translateContent(content: any, sourceLang: string, targetLang: string): Promise<any> {
    // Создаем промт для OpenAI
    const prompt = this.createTranslationPrompt(content, sourceLang, targetLang);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Ты профессиональный переводчик. Переводи только текстовый контент, сохраняя структуру JSON. Не переводи ключи объектов, только значения.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    });

    const translatedText = response.choices[0]?.message?.content?.trim();
    
    if (!translatedText) {
      throw new Error('Empty response from OpenAI');
    }

    try {
      return JSON.parse(translatedText);
    } catch (error) {
      this.logger.error('Failed to parse OpenAI response as JSON:', translatedText);
      throw new Error('Invalid JSON response from OpenAI');
    }
  }

  private createTranslationPrompt(content: any, sourceLang: string, targetLang: string): string {
    const sourceLanguageName = this.getLanguageName(sourceLang);
    const targetLanguageName = this.getLanguageName(targetLang);
    
    return `Переведи следующий JSON контент с языка "${sourceLanguageName}" на язык "${targetLanguageName}".

ВАЖНО:
- Переводи только текстовые значения, НЕ переводи ключи объектов
- Сохраняй точную структуру JSON
- Если это FAQ блок, переводи question и answer
- Если это другой тип блока, переводи все текстовые поля
- Сохраняй HTML теги если они есть
- Возвращай только JSON без дополнительных объяснений

Исходный контент:
${JSON.stringify(content, null, 2)}

Переведенный контент:`;
  }

  private getLanguageName(code: string): string {
    const languages = {
      'ru': 'русский',
      'en': 'английский',
      'es': 'испанский',
      'fr': 'французский',
      'de': 'немецкий',
      'it': 'итальянский',
      'pt': 'португальский',
      'pl': 'польский',
      'uk': 'украинский',
      'cs': 'чешский',
      'sk': 'словацкий',
      'bg': 'болгарский',
      'hr': 'хорватский',
      'sr': 'сербский',
      'sl': 'словенский',
      'ro': 'румынский',
      'hu': 'венгерский',
      'lv': 'латвийский',
      'lt': 'литовский',
      'et': 'эстонский',
      'fi': 'финский',
      'sv': 'шведский',
      'no': 'норвежский',
      'da': 'датский',
      'nl': 'голландский',
      'tr': 'турецкий',
      'ar': 'арабский',
      'zh': 'китайский',
      'ja': 'японский',
      'ko': 'корейский',
      'th': 'тайский',
      'vi': 'вьетнамский',
      'hi': 'хинди',
      'bn': 'бенгальский',
      'ta': 'тамильский',
      'te': 'телугу',
      'ml': 'малаялам',
      'kn': 'каннада',
      'gu': 'гуджарати',
      'pa': 'панджаби',
      'mr': 'маратхи',
      'or': 'ория',
      'as': 'ассамский',
      'ur': 'урду',
      'fa': 'персидский',
      'he': 'иврит',
      'sw': 'суахили',
      'am': 'амхарский',
      'zu': 'зулу',
      'af': 'африкаанс',
      'ms': 'малайский',
      'id': 'индонезийский',
      'tl': 'тагальский',
      'ceb': 'себуанский',
      'haw': 'гавайский',
      'mg': 'малагасийский',
      'sm': 'самоанский',
      'to': 'тонганский',
      'mi': 'маори',
      'cy': 'валлийский',
      'ga': 'ирландский',
      'gd': 'шотландский гэльский',
      'is': 'исландский',
      'mt': 'мальтийский',
      'eu': 'баскский',
      'ca': 'каталанский',
      'gl': 'галисийский',
      'eo': 'эсперанто',
      'la': 'латинский',
      'jw': 'яванский',
      'su': 'сунданский',
      'ne': 'непальский',
      'si': 'сингальский',
      'km': 'кхмерский',
      'lo': 'лаосский',
      'my': 'мьянманский',
      'ka': 'грузинский',
      'hy': 'армянский',
      'az': 'азербайджанский',
      'kk': 'казахский',
      'ky': 'киргизский',
      'tg': 'таджикский',
      'tk': 'туркменский',
      'uz': 'узбекский',
      'mn': 'монгольский',
      'bo': 'тибетский',
      'dz': 'дзонг-кэ',
      'br': 'бретонский',
      'co': 'корсиканский',
      'fy': 'фризский',
      'lb': 'люксембургский',
      'rm': 'романшский',
      'wa': 'валлонский',
      'yi': 'идиш',
      'se': 'шведский',
      'cz': 'чешский',
      'gr': 'греческий',
      'kr': 'корейский',
      'jp': 'японский',
      'in': 'хинди'
    };

    return languages[code] || code;
  }
}