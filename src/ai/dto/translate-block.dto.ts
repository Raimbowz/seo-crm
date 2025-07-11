import { IsNotEmpty, IsString, IsObject, IsArray } from 'class-validator';

export class TranslateBlockDto {
  @IsNotEmpty()
  @IsObject()
  blockData: any;

  @IsNotEmpty()
  @IsString()
  sourceLanguage: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  targetLanguages: string[];
}