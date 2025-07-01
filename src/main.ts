import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppConfigService } from './config/config.service';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import * as path from 'path';

async function bootstrap() {
  // Use Fastify instead of Express
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(AppConfigService);
  app.register(multipart as any, {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20 MB
    },
  });
  app.register(fastifyStatic as any, {
    root: path.join(__dirname, '../files/images'),
    prefix: '/images/static/',
    decorateReply: false,
  });

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('SEO CRM Backend API')
    .setDescription('API documentation for the SEO CRM backend service')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the server - EXPLICITLY USE PORT 3002 FOR BACKEND
  const port = 3002; // Hardcoded to avoid any conflicts - backend should always use 3002
  await app.listen(port, '0.0.0.0');
  console.log(`Backend Service is running on port ${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/api`);
}
bootstrap();
