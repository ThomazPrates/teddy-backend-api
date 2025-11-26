import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Url } from './entities/url.entity';
  import { CreateShortUrlDto } from './dto/create-short-url.dto';
  import { UpdateUrlDto } from './dto/update-url.dto';
  import { generateShortCode, SHORT_CODE_LENGTH } from '../shared/utils/short-code.util';
  import { User } from '../user/entities/user.entity';
  
  @Injectable()
  export class ShortenService {
    constructor(
      @InjectRepository(Url)
      private readonly urlRepository: Repository<Url>,
    ) {}
  
    async createShortUrl(
      createShortUrlDto: CreateShortUrlDto,
      ownerId?: number,
    ): Promise<Url> {
      if (createShortUrlDto.alias && !ownerId) {
        throw new ForbiddenException(
          'Apenas usuários autenticados podem definir alias customizados',
        );
      }
  
      const shortCode = createShortUrlDto.alias
        ? createShortUrlDto.alias
        : await this.generateUniqueShortCode();
  
      const shortCodeToUse = shortCode.trim();
      if (shortCodeToUse.length !== SHORT_CODE_LENGTH) {
        throw new BadRequestException('O código precisa ter 6 caracteres.');
      }
  
      const exists = await this.urlRepository.findOne({
        where: { shortCode: shortCodeToUse },
        withDeleted: true,
      });
      if (exists) {
        throw new BadRequestException('Alias já está em uso');
      }
  
      const entity = this.urlRepository.create({
        shortCode: shortCodeToUse,
        originalUrl: createShortUrlDto.originalUrl,
        owner: ownerId ? ({ id: ownerId } as User) : undefined,
      });
  
      return this.urlRepository.save(entity);
    }
  
    async listByOwner(ownerId: number): Promise<Url[]> {
      return this.urlRepository.find({
        where: { owner: { id: ownerId } },
        order: { createdAt: 'DESC' },
      });
    }
  
    async updateUrl(id: number, ownerId: number, dto: UpdateUrlDto): Promise<Url> {
      const url = await this.urlRepository.findOne({
        where: { id },
        relations: ['owner'],
      });
  
      if (!url) {
        throw new NotFoundException('URL não encontrada');
      }
  
      if (!url.owner || url.owner.id !== ownerId) {
        throw new ForbiddenException('Você não pode editar esta URL');
      }
  
      url.originalUrl = dto.originalUrl;
      return this.urlRepository.save(url);
    }
  
    async softDelete(id: number, ownerId: number): Promise<void> {
      const url = await this.urlRepository.findOne({
        where: { id },
        relations: ['owner'],
      });
  
      if (!url) {
        throw new NotFoundException('URL não encontrada');
      }
  
      if (!url.owner || url.owner.id !== ownerId) {
        throw new ForbiddenException('Você não pode excluir esta URL');
      }
  
      await this.urlRepository.softRemove(url);
    }
  
    async findByShortCode(shortCode: string): Promise<Url> {
      const url = await this.urlRepository.findOne({ where: { shortCode } });
      if (!url) {
        throw new NotFoundException('Link não encontrado');
      }
      return url;
    }
  
    async trackAccess(shortCode: string): Promise<Url> {
      const url = await this.findByShortCode(shortCode);
      url.accessCount += 1;
      return this.urlRepository.save(url);
    }
  
    private async generateUniqueShortCode(): Promise<string> {
      let code: string;
      let exists = true;
  
      do {
        code = generateShortCode();
        exists = !!(await this.urlRepository.findOne({
          where: { shortCode: code },
          withDeleted: true,
        }));
      } while (exists);
  
      return code;
    }
  }