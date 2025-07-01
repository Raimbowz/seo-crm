import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LocalizationsService } from '../localizations/localizations.service';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const localizationsService = app.get(LocalizationsService);

  try {
    console.log('Начинаю импорт локализаций...');
    // Поиск файла
    let filePath;
    const possiblePaths = [
      path.resolve(__dirname, '../../../files/locals.csv'),
      path.resolve(__dirname, '../../files/locals.csv'),
      path.resolve(__dirname, '../files/locals.csv'),
      path.resolve(__dirname, '../../../../files/locals.csv'),
      path.resolve(process.cwd(), 'files/locals.csv'),
    ];
    for (const potentialPath of possiblePaths) {
      if (fs.existsSync(potentialPath)) {
        filePath = potentialPath;
        console.log(`Файл найден: ${filePath}`);
        break;
      }
    }
    if (!filePath) {
      throw new Error('Не найден файл locals.csv. Проверьте расположение.');
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n').filter(Boolean);
    if (lines.length < 2) {
      throw new Error('Файл пуст или содержит только заголовки.');
    }
    let successCount = 0;
    let failureCount = 0;
    // Пропускаем первую строку (заголовки)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const parts = line.split(',');
      if (parts.length < 5) {
        console.warn(`Строка ${i + 1} пропущена (мало столбцов): ${line}`);
        continue;
      }
      const language = parts[1].trim();
      const text = parts[2].trim();
      const name = parts[4].trim();
      const description = parts[0].trim();

      try {
        // Проверяем, есть ли уже такая локализация
        // (по language)
        const existing = (await localizationsService.findAll()).find(
          (l) => l.language === language,
        );
        if (existing) {
          await localizationsService.update(existing.id, {
            language,
            text,
            name,
            description,
            isActive: true,
          });
        } else {
          await localizationsService.create({
            language,
            text,
            name,
            description,
            isActive: true,
          });
        }
        successCount++;
      } catch (error) {
        console.error(`Ошибка при импорте строки ${i + 1}:`, error.message);
        failureCount++;
      }
    }
    console.log(
      `Импорт завершён. Успешно: ${successCount}, Ошибок: ${failureCount}`,
    );
  } catch (error) {
    console.error('Ошибка при импорте:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
