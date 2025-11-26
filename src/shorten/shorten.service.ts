// src/shorten/shorten.service.ts

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';

import {
  generateShortCode,
  SHORT_CODE_LENGTH,
} from '../shared/helpers/short-code.helper';

import { ShortenRepository } from './shorten.repository';
import { Url } from './entities/url.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ShortenService {
  constructor(private readonly repository: ShortenRepository) {}

  async createShortUrl(dto: CreateShortUrlDto, ownerId?: number): Promise<Url> {
    if (dto.alias && !ownerId) {
      throw new ForbiddenException(
        'Apenas usuários autenticados podem definir alias customizados',
      );
    }

    const shortCode = dto.alias
      ? dto.alias
      : await this.generateUniqueShortCode();

    const shortCodeToUse = shortCode.trim();

    if (shortCodeToUse.length !== SHORT_CODE_LENGTH) {
      throw new BadRequestException(
        `O código precisa ter ${SHORT_CODE_LENGTH} caracteres.`,
      );
    }

    const exists = await this.repository.findWithDeleted(shortCodeToUse);
    if (exists) {
      throw new BadRequestException('Alias já está em uso');
    }

    const entity = this.repository.create({
      shortCode: shortCodeToUse,
      originalUrl: dto.originalUrl,
      owner: ownerId ? ({ id: ownerId } as User) : undefined,
    });

    return this.repository.save(entity);
  }

  async listByOwner(ownerId: number): Promise<Url[]> {
    return this.repository.listByOwner(ownerId);
  }

  async updateUrl(id: number, ownerId: number, dto: UpdateUrlDto) {
    const url = await this.repository.findById(id);

    if (!url) throw new NotFoundException('URL não encontrada');
    if (!url.owner || url.owner.id !== ownerId) {
      throw new ForbiddenException('Você não pode editar esta URL');
    }

    url.originalUrl = dto.originalUrl;

    return this.repository.save(url);
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
