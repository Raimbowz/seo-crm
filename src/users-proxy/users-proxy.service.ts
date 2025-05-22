import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class UsersProxyService {
  private readonly ssoUrl = process.env.SSO_SERVICE_URL || 'http://localhost:3001'; // Укажите актуальный порт sso

  constructor(private readonly http: HttpService) {}

  private getAuthHeader(req: Request) {
    const auth = req.headers['authorization'];
    return auth ? { Authorization: auth } : {};
  }

  async findAll(req: Request) {
    const res = await firstValueFrom(
      this.http.get(`${this.ssoUrl}/users`, { headers: this.getAuthHeader(req) })
    );
    return res.data;
  }

  async findOne(id: number, req: Request) {       
    const res = await firstValueFrom(
      this.http.get(`${this.ssoUrl}/users/${id}`, { headers: this.getAuthHeader(req) })
    );
    console.log(res.data);
    return res.data;
  }

  async create(data: any, req: Request) {
    const res = await firstValueFrom(
      this.http.post(`${this.ssoUrl}/users`, data, { headers: this.getAuthHeader(req) })
    );
    return res.data;
  }

  async update(id: number, data: any, req: Request) {
    const res = await firstValueFrom(
      this.http.patch(`${this.ssoUrl}/users/${id}`, data, { headers: this.getAuthHeader(req) })
    );
    return res.data;
  }

  async delete(id: number, req: Request) {
    const res = await firstValueFrom(
      this.http.delete(`${this.ssoUrl}/users/${id}`, { headers: this.getAuthHeader(req) })
    );
    return res.data;
  }
} 