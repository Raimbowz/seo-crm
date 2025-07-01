import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { VariablesService } from './variables.service';
import { CreateVariableDto } from './dto/create-variable.dto';
import { UpdateVariableDto } from './dto/update-variable.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { Variable } from './entities/variable.entity';

@ApiTags('variables')
@Controller('variables')
@ApiBearerAuth()
export class VariablesController {
  constructor(private readonly variablesService: VariablesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new variable',
    description: 'Создать новую переменную для SEO парсинга.',
  })
  @ApiResponse({
    status: 201,
    description: 'Variable created successfully',
    type: Variable,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Variable with this key already exists.',
  })
  create(@Body() dto: CreateVariableDto) {
    return this.variablesService.createVariable(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all variables',
    description: 'Получить список всех переменных.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all variables',
    type: [Variable],
  })
  findAll() {
    return this.variablesService.getAllVariables();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a variable by id',
    description: 'Получить переменную по id.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the variable',
    type: Variable,
  })
  @ApiResponse({ status: 404, description: 'Variable not found' })
  findOne(@Param('id') id: string) {
    return this.variablesService.getVariableById(Number(id));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a variable',
    description: 'Обновить переменную по id.',
  })
  @ApiResponse({
    status: 200,
    description: 'Variable updated successfully',
    type: Variable,
  })
  @ApiResponse({ status: 404, description: 'Variable not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(@Param('id') id: string, @Body() dto: UpdateVariableDto) {
    console.log('update', id, dto);
    return this.variablesService.updateVariable(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a variable',
    description: 'Удалить переменную по id.',
  })
  @ApiResponse({ status: 200, description: 'Variable deleted successfully' })
  @ApiResponse({ status: 404, description: 'Variable not found' })
  remove(@Param('id') id: string) {
    return this.variablesService.deleteVariable(Number(id));
  }

  @ApiOperation({
    summary: 'Parse text and replace variables',
    description: 'Парсит текст и заменяет {{KEY}} на значения переменных.',
  })
  @ApiResponse({
    status: 200,
    description: 'Parsed text with variables replaced',
    schema: { example: 'Title: Главная страница' },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({
    schema: {
      example: { text: 'Title: {{PAGE_TITLE}}' },
      properties: {
        text: { type: 'string', description: 'Text with {{KEY}} placeholders' },
      },
      required: ['text'],
    },
  })
  @Post('parse')
  parse(@Body('text') text: string) {
    return this.variablesService.parseText(text);
  }
}
