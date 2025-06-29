import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get port(): number {
    return Number(this.configService.get<number>('PORT', 3002));
  }

  get ssoServiceUrl(): string {
    return this.configService.get<string>(
      'SSO_SERVICE_URL',
      'http://localhost:3001',
    );
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET', 'devSecretKey');
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '24h');
  }

  get dbHost(): string {
    return this.configService.get<string>('DB_HOST', 'localhost');
  }

  get dbPort(): number {
    return Number(this.configService.get<number>('DB_PORT', 5432));
  }

  get dbUsername(): string {
    return this.configService.get<string>('DB_USERNAME', 'postgres');
  }

  get dbPassword(): string {
    return this.configService.get<string>('DB_PASSWORD', 'postgres');
  }

  get dbName(): string {
    return this.configService.get<string>('DB_NAME', 'seo_crm_backend');
  }

  

  get dbSynchronize(): boolean {
    return this.configService.get<boolean>('DB_SYNCHRONIZE', true);
  }
}
