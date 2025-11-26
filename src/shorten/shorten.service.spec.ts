import { Test, TestingModule } from '@nestjs/testing';
import { ShortenService } from './shorten.service';
import { ShortenRepository } from './shorten.repository';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Url } from './entities/url.entity';
import { User } from '../user/entities/user.entity';
import * as shortCodeHelper from '../shared/helpers/short-code.helper';

jest.mock('../shared/helpers/short-code.helper');

describe('ShortenService', () => {
  let service: ShortenService;
  let repository: ShortenRepository;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findWithDeleted: jest.fn(),
    findById: jest.fn(),
    findByShortCode: jest.fn(),
    listByOwner: jest.fn(),
    softDelete: jest.fn(),
    findByShortCodeCaseInsensitive: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      if (key === 'app.baseUrl') {
        return 'http://localhost:3000';
      }
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenService,
        {
          provide: ShortenRepository,
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ShortenService>(ShortenService);
    repository = module.get<ShortenRepository>(ShortenRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createShortUrl', () => {
    it('should create a short URL with generated code for authenticated user', async () => {
      const dto: CreateShortUrlDto = {
        originalUrl: 'https://example.com',
      };
      const ownerId = 1;
      const generatedCode = 'abc123';

      (shortCodeHelper.generateShortCode as jest.Mock).mockReturnValue(
        generatedCode,
      );
      (shortCodeHelper.SHORT_CODE_LENGTH as number) = 6;
      mockRepository.findWithDeleted.mockResolvedValue(null);

      const mockUrl = {
        id: 1,
        shortCode: generatedCode,
        originalUrl: dto.originalUrl,
        owner: { id: ownerId } as User,
      } as Url;

      mockRepository.create.mockReturnValue(mockUrl);
      mockRepository.save.mockResolvedValue(mockUrl);

      const result = await service.createShortUrl(dto, ownerId);

      expect(result).toEqual(mockUrl);
      expect(repository.findWithDeleted).toHaveBeenCalledWith(generatedCode);
      expect(repository.create).toHaveBeenCalledWith({
        shortCode: generatedCode,
        originalUrl: dto.originalUrl.trim(),
        owner: { id: ownerId },
      });
      expect(repository.save).toHaveBeenCalledWith(mockUrl);
    });

    it('should create a short URL without owner for anonymous user', async () => {
      const dto: CreateShortUrlDto = {
        originalUrl: 'https://example.com',
      };
      const generatedCode = 'abc123';

      (shortCodeHelper.generateShortCode as jest.Mock).mockReturnValue(
        generatedCode,
      );
      (shortCodeHelper.SHORT_CODE_LENGTH as number) = 6;
      mockRepository.findWithDeleted.mockResolvedValue(null);

      const mockUrl = {
        id: 1,
        shortCode: generatedCode,
        originalUrl: dto.originalUrl,
        owner: undefined,
      } as Url;

      mockRepository.create.mockReturnValue(mockUrl);
      mockRepository.save.mockResolvedValue(mockUrl);

      const result = await service.createShortUrl(dto);

      expect(result).toEqual(mockUrl);
      expect(repository.create).toHaveBeenCalledWith({
        shortCode: generatedCode,
        originalUrl: dto.originalUrl.trim(),
        owner: undefined,
      });
    });

    it('should create a short URL with custom alias for authenticated user', async () => {
      const dto: CreateShortUrlDto = {
        originalUrl: 'https://example.com',
        alias: 'custom',
      };
      const ownerId = 1;

      mockRepository.findByShortCodeCaseInsensitive.mockResolvedValue(null);
      mockRepository.findWithDeleted.mockResolvedValue(null);

      const mockUrl = {
        id: 1,
        shortCode: 'custom',
        originalUrl: dto.originalUrl,
        owner: { id: ownerId } as User,
      } as Url;

      mockRepository.create.mockReturnValue(mockUrl);
      mockRepository.save.mockResolvedValue(mockUrl);

      const result = await service.createShortUrl(dto, ownerId);

      expect(result).toEqual(mockUrl);
      expect(repository.findByShortCodeCaseInsensitive).toHaveBeenCalledWith('custom');
      expect(repository.findWithDeleted).toHaveBeenCalledWith('custom');
    });

    it('should throw ForbiddenException when anonymous user tries to use alias', async () => {
      const dto: CreateShortUrlDto = {
        originalUrl: 'https://example.com',
        alias: 'custom',
      };

      await expect(service.createShortUrl(dto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.createShortUrl(dto)).rejects.toThrow(
        'Apenas usuários autenticados podem definir alias customizados',
      );
    });

    it('should throw BadRequestException when alias is a reserved route', async () => {
      const dto: CreateShortUrlDto = {
        originalUrl: 'https://example.com',
        alias: 'auth',
      };
      const ownerId = 1;

      await expect(service.createShortUrl(dto, ownerId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createShortUrl(dto, ownerId)).rejects.toThrow(
        'O alias "auth" é uma rota reservada e não pode ser usado',
      );
    });

    it('should throw BadRequestException when alias already exists', async () => {
      const dto: CreateShortUrlDto = {
        originalUrl: 'https://example.com',
        alias: 'exists',
      };
      const ownerId = 1;

      mockRepository.findByShortCodeCaseInsensitive.mockResolvedValue({
        id: 1,
        shortCode: 'exists',
      } as Url);

      await expect(service.createShortUrl(dto, ownerId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createShortUrl(dto, ownerId)).rejects.toThrow(
        'Alias já está em uso',
      );
      expect(repository.findByShortCodeCaseInsensitive).toHaveBeenCalledWith('exists');
    });

    it('should generate unique code when first attempt collides', async () => {
      const dto: CreateShortUrlDto = {
        originalUrl: 'https://example.com',
      };
      const ownerId = 1;
      const firstCode = 'abc123';
      const secondCode = 'def456';

      (shortCodeHelper.generateShortCode as jest.Mock)
        .mockReturnValueOnce(firstCode)
        .mockReturnValueOnce(secondCode);
      (shortCodeHelper.SHORT_CODE_LENGTH as number) = 6;

      mockRepository.findWithDeleted
        .mockResolvedValueOnce({ id: 1, shortCode: firstCode })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const mockUrl = {
        id: 1,
        shortCode: secondCode,
        originalUrl: dto.originalUrl,
        owner: { id: ownerId } as User,
      } as Url;

      mockRepository.create.mockReturnValue(mockUrl);
      mockRepository.save.mockResolvedValue(mockUrl);

      const result = await service.createShortUrl(dto, ownerId);

      expect(result.shortCode).toBe(secondCode);
      expect(shortCodeHelper.generateShortCode).toHaveBeenCalledTimes(2);
      expect(mockRepository.findWithDeleted).toHaveBeenCalledTimes(3);
    });
  });

  describe('listByOwner', () => {
    it('should return list of URLs for owner', async () => {
      const ownerId = 1;
      const mockUrls = [
        {
          id: 1,
          shortCode: 'abc123',
          originalUrl: 'https://example.com',
          owner: { id: ownerId } as User,
          accessCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          shortCode: 'def456',
          originalUrl: 'https://example2.com',
          owner: { id: ownerId } as User,
          accessCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as Url[];

      mockRepository.listByOwner.mockResolvedValue(mockUrls);

      const result = await service.listByOwner(ownerId);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('shortUrl');
      expect(result[0].shortUrl).toBe('http://localhost:3000/abc123');
      expect(result[1].shortUrl).toBe('http://localhost:3000/def456');
      expect(repository.listByOwner).toHaveBeenCalledWith(ownerId);
    });

    it('should return empty array when owner has no URLs', async () => {
      const ownerId = 1;
      mockRepository.listByOwner.mockResolvedValue([]);

      const result = await service.listByOwner(ownerId);

      expect(result).toEqual([]);
      expect(repository.listByOwner).toHaveBeenCalledWith(ownerId);
    });
  });

  describe('updateUrl', () => {
    it('should update URL successfully', async () => {
      const id = 1;
      const ownerId = 1;
      const dto: UpdateUrlDto = {
        originalUrl: 'https://updated-example.com',
      };

      const mockUrl = {
        id,
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        owner: { id: ownerId } as User,
      } as Url;

      const updatedUrl = {
        ...mockUrl,
        originalUrl: dto.originalUrl,
      };

      mockRepository.findById.mockResolvedValue(mockUrl);
      mockRepository.save.mockResolvedValue(updatedUrl);

      const result = await service.updateUrl(id, ownerId, dto);

      expect(result).toHaveProperty('shortUrl');
      expect(result.originalUrl).toBe(dto.originalUrl);
      expect(result.shortUrl).toBe('http://localhost:3000/abc123');
      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when URL does not exist', async () => {
      const id = 1;
      const ownerId = 1;
      const dto: UpdateUrlDto = {
        originalUrl: 'https://updated-example.com',
      };

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.updateUrl(id, ownerId, dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updateUrl(id, ownerId, dto)).rejects.toThrow(
        'URL não encontrada',
      );
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      const id = 1;
      const ownerId = 1;
      const differentOwnerId = 2;
      const dto: UpdateUrlDto = {
        originalUrl: 'https://updated-example.com',
      };

      const mockUrl = {
        id,
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        owner: { id: differentOwnerId } as User,
      } as Url;

      mockRepository.findById.mockResolvedValue(mockUrl);

      await expect(service.updateUrl(id, ownerId, dto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.updateUrl(id, ownerId, dto)).rejects.toThrow(
        'Você não pode editar esta URL',
      );
    });

    it('should throw ForbiddenException when URL has no owner', async () => {
      const id = 1;
      const ownerId = 1;
      const dto: UpdateUrlDto = {
        originalUrl: 'https://updated-example.com',
      };

      const mockUrl = {
        id,
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        owner: null,
      } as Url;

      mockRepository.findById.mockResolvedValue(mockUrl);

      await expect(service.updateUrl(id, ownerId, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete URL successfully', async () => {
      const id = 1;
      const ownerId = 1;

      const mockUrl = {
        id,
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        owner: { id: ownerId } as User,
      } as Url;

      mockRepository.findById.mockResolvedValue(mockUrl);
      mockRepository.softDelete.mockResolvedValue(undefined);

      await service.softDelete(id, ownerId);

      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(repository.softDelete).toHaveBeenCalledWith(mockUrl);
    });

    it('should throw NotFoundException when URL does not exist', async () => {
      const id = 1;
      const ownerId = 1;

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.softDelete(id, ownerId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.softDelete(id, ownerId)).rejects.toThrow(
        'URL não encontrada',
      );
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      const id = 1;
      const ownerId = 1;
      const differentOwnerId = 2;

      const mockUrl = {
        id,
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        owner: { id: differentOwnerId } as User,
      } as Url;

      mockRepository.findById.mockResolvedValue(mockUrl);

      await expect(service.softDelete(id, ownerId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.softDelete(id, ownerId)).rejects.toThrow(
        'Você não pode excluir esta URL',
      );
    });

    it('should throw ForbiddenException when URL has no owner', async () => {
      const id = 1;
      const ownerId = 1;

      const mockUrl = {
        id,
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        owner: null,
      } as Url;

      mockRepository.findById.mockResolvedValue(mockUrl);

      await expect(service.softDelete(id, ownerId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findByShortCode', () => {
    it('should return URL when found', async () => {
      const shortCode = 'abc123';
      const mockUrl = {
        id: 1,
        shortCode,
        originalUrl: 'https://example.com',
        accessCount: 0,
      } as Url;

      mockRepository.findByShortCode.mockResolvedValue(mockUrl);

      const result = await service.findByShortCode(shortCode);

      expect(result).toEqual(mockUrl);
      expect(repository.findByShortCode).toHaveBeenCalledWith(shortCode);
    });

    it('should throw NotFoundException when URL not found', async () => {
      const shortCode = 'abc123';

      mockRepository.findByShortCode.mockResolvedValue(null);

      await expect(service.findByShortCode(shortCode)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByShortCode(shortCode)).rejects.toThrow(
        'Link não encontrado',
      );
    });
  });

  describe('trackAccess', () => {
    it('should increment access count and save URL', async () => {
      const shortCode = 'abc123';
      const mockUrl = {
        id: 1,
        shortCode,
        originalUrl: 'https://example.com',
        accessCount: 5,
      } as Url;

      const updatedUrl = {
        ...mockUrl,
        accessCount: 6,
      };

      mockRepository.findByShortCode.mockResolvedValue(mockUrl);
      mockRepository.save.mockResolvedValue(updatedUrl);

      const result = await service.trackAccess(shortCode);

      expect(result.accessCount).toBe(6);
      expect(repository.findByShortCode).toHaveBeenCalledWith(shortCode);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ accessCount: 6 }),
      );
    });

    it('should throw NotFoundException when URL not found during tracking', async () => {
      const shortCode = 'abc123';

      mockRepository.findByShortCode.mockResolvedValue(null);

      await expect(service.trackAccess(shortCode)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});