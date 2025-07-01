import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CitiesService } from '../cities/cities.service';
import * as fs from 'fs';
import * as path from 'path';
import { CreateCityDto } from '../cities/dto/create-city.dto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const citiesService = app.get(CitiesService);

  try {
    console.log('Starting cities import...');

    // Read the CSV file - try different possible locations
    let filePath;
    const possiblePaths = [
      path.resolve(__dirname, '../../../files/cities_inflection.csv'),
      path.resolve(__dirname, '../../files/cities_inflection.csv'),
      path.resolve(__dirname, '../files/cities_inflection.csv'),
      path.resolve(__dirname, '../../../../files/cities_inflection.csv'),
      path.resolve(process.cwd(), 'files/cities_inflection.csv'),
    ];

    for (const potentialPath of possiblePaths) {
      if (fs.existsSync(potentialPath)) {
        filePath = potentialPath;
        console.log(`Found CSV file at: ${filePath}`);
        break;
      }
    }

    if (!filePath) {
      throw new Error(
        'Could not find the cities_inflection.csv file. Please check its location.',
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Parse the CSV content
    const lines = fileContent.split('\n');
    const cities: CreateCityDto[] = [];

    for (const line of lines) {
      if (!line.trim()) {
        continue; // Skip empty lines
      }

      const [
        name,
        nameGenitive,
        nameDative,
        nameAccusative,
        nameInstrumental,
        namePrepositional,
      ] = line.split(',');

      cities.push({
        name,
        nameGenitive,
        nameDative,
        nameAccusative,
        nameInstrumental,
        namePrepositional,
        isActive: true,
      });
    }

    console.log(`Found ${cities.length} cities in CSV file.`);

    // Import cities in batches to avoid overloading the database
    const batchSize = 100;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < cities.length; i += batchSize) {
      const batch = cities.slice(i, i + batchSize);
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(cities.length / batchSize)}`,
      );

      for (const cityData of batch) {
        try {
          // Check if city already exists
          const existingCities = await citiesService.findByName(cityData.name);

          if (existingCities.length === 0) {
            await citiesService.create(cityData);
            successCount++;
          } else {
            console.log(`City "${cityData.name}" already exists, updating...`);
            await citiesService.update(existingCities[0].id, cityData);
            successCount++;
          }
        } catch (error) {
          console.error(
            `Failed to import city "${cityData.name}":`,
            error.message,
          );
          failureCount++;
        }
      }
    }

    console.log(
      `Import completed. Success: ${successCount}, Failures: ${failureCount}`,
    );
  } catch (error) {
    console.error('An error occurred during import:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
