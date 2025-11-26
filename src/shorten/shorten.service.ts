import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';

import {
  generateShortCode,
} from '../shared/helpers/short-code.helper';

import { ShortenRepository } from './shorten.repository';
import { Url } from './entities/url.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ShortenService {
  constructor(
    private readonly repository: ShortenRepository,
    private readonly configService: ConfigService,
  ) {}

  private getBaseUrl(): string {
    return this.configService.get<string>('app.baseUrl', 'http://localhost:3000');
  }

  private buildShortUrl(shortCode: string): string {
    const baseUrl = this.getBaseUrl().replace(/\/$/, '');
    return `${baseUrl}/${shortCode}`;
  }

  private readonly RESERVED_ROUTES = ['auth', 'users', 'shorten', 'redirect', 'api-docs', 'docs', 'api'];

  async createShortUrl(dto: CreateShortUrlDto, ownerId?: number): Promise<Url> {
    if (dto.alias && !ownerId) {
      throw new ForbiddenException(
        'Apenas usuários autenticados podem definir alias customizados',
      );
    }

    let shortCode: string;

    if (dto.alias) {
      const normalizedAlias = dto.alias.toLowerCase().trim();

      if (this.RESERVED_ROUTES.includes(normalizedAlias)) {
        throw new BadRequestException(
          `O alias "${normalizedAlias}" é uma rota reservada e não pode ser usado`,
        );
      }

      const existing = await this.repository.findByShortCodeCaseInsensitive(normalizedAlias);
      if (existing) {
        throw new BadRequestException('Alias já está em uso');
      }

      shortCode = normalizedAlias;
    } else {
      shortCode = await this.generateUniqueShortCode();
    }

    const exists = await this.repository.findWithDeleted(shortCode);
    if (exists) {
      throw new BadRequestException('Código já está em uso');
    }

    const entity = this.repository.create({
      shortCode,
      originalUrl: dto.originalUrl.trim(),
      owner: ownerId ? ({ id: ownerId } as User) : undefined,
    });

    return this.repository.save(entity);
  }

  toShortUrlResponse(url: Url): any {
    return {
      id: url.id,
      originalUrl: url.originalUrl,
      shortUrl: this.buildShortUrl(url.shortCode),
      shortCode: url.shortCode,
      alias: url.shortCode,
      accessCount: url.accessCount,
      ownerId: url.owner?.id,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    };
  }

  async listByOwner(ownerId: number): Promise<any[]> {
    const urls = await this.repository.listByOwner(ownerId);
    return urls.map((url) => this.toShortUrlResponse(url));
  }

  async updateUrl(id: number, ownerId: number, dto: UpdateUrlDto) {
    const url = await this.repository.findById(id);

    if (!url) throw new NotFoundException('URL não encontrada');
    if (!url.owner || url.owner.id !== ownerId) {
      throw new ForbiddenException('Você não pode editar esta URL');
    }

    url.originalUrl = dto.originalUrl;

    const savedUrl = await this.repository.save(url);
    return this.toShortUrlResponse(savedUrl);
  }

  async softDelete(id: number, ownerId: number): Promise<void> {
    const url = await this.repository.findById(id);

    if (!url) throw new NotFoundException('URL não encontrada');
    if (!url.owner || url.owner.id !== ownerId) {
      throw new ForbiddenException('Você não pode excluir esta URL');
    }

    await this.repository.softDelete(url);
  }

  async findByShortCode(shortCode: string): Promise<Url> {
    const url = await this.repository.findByShortCode(shortCode);
    if (!url) throw new NotFoundException('Link não encontrado');
    return url;
  }

  async trackAccess(shortCode: string): Promise<Url> {
    const url = await this.findByShortCode(shortCode);
    url.accessCount += 1;
    return this.repository.save(url);
  }

  private async generateUniqueShortCode(): Promise<string> {
    let code: string;
    let exists = true;

    do {
      code = generateShortCode();
      const deleted = await this.repository.findWithDeleted(code);
      exists = !!deleted;
    } while (exists);

    return code;
  }
}
