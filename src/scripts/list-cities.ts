import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CitiesService } from '../cities/cities.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const citiesService = app.get(CitiesService);

  try {
    console.log('Listing cities from database...');

    const cities = await citiesService.findAll();

    console.log(`Found ${cities.length} cities in the database:`);

    cities.forEach((city) => {
      console.log(`ID: ${city.id}`);
      console.log(`Name: ${city.name}`);
      console.log(`Genitive: ${city.nameGenitive}`);
      console.log(`Dative: ${city.nameDative}`);
      console.log(`Accusative: ${city.nameAccusative}`);
      console.log(`Instrumental: ${city.nameInstrumental}`);
      console.log(`Prepositional: ${city.namePrepositional}`);
      console.log('-----------------------------------');
    });
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
