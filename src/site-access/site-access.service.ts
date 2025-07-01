import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteAccess } from './entities/site-access.entity';
import { CreateSiteAccessDto } from './dto/create-site-access.dto';
import { UpdateSiteAccessDto } from './dto/update-site-access.dto';
import { UsersProxyService } from 'src/users-proxy/users-proxy.service';
import { Request } from 'express';
@Injectable()
export class SiteAccessService {
  constructor(
    @InjectRepository(SiteAccess)
    private readonly siteAccessRepository: Repository<SiteAccess>,
    private readonly usersProxyService: UsersProxyService,
  ) {}

  async create(dto: CreateSiteAccessDto) {
    // Проверка на уникальность пары userId+siteId
    const exists = await this.siteAccessRepository.findOne({
      where: { userId: dto.userId, siteId: dto.siteId },
    });
    if (exists) {
      return exists; // или можно выбросить ошибку, если нужно
    }
    const access = this.siteAccessRepository.create(dto);
    return this.siteAccessRepository.save(access);
  }

  async findAll(req: Request) {
    const sites = await this.siteAccessRepository.find({
      relations: ['site'],
    });
    const sitesWithPermissions = await Promise.all(
      sites.map(async (site) => {
        const user = await this.usersProxyService.findOne(site.userId, req);
        return { ...site, user: user };
      }),
    );
    return sitesWithPermissions;
  }

  findOne(id: number) {
    return this.siteAccessRepository.findOneBy({ id });
  }

  update(id: number, dto: UpdateSiteAccessDto) {
    return this.siteAccessRepository.update(id, dto);
  }

  remove(id: number) {
    return this.siteAccessRepository.delete(id);
  }
}
