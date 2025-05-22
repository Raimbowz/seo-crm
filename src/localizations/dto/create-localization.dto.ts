import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
 
export class CreateLocalizationDto {
    @ApiProperty({ example: 'block', description: 'Тип сущности (например, block, page, partner)' })

    entityType: string;

    @ApiProperty({ example: 1, description: 'ID сущности' })
    entityId: number;

    @ApiProperty({ example: 'ru', description: 'Язык локализации' })
    language: string;

    @ApiProperty({ example: 'Название', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'Описание', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'Текст', required: false })
    @IsString()
    @IsOptional()
    text?: string;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ example: 'Контент', required: false })
    @IsString()
    @IsOptional()
    content?: string;
}