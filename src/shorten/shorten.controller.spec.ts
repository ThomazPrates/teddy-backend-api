import { Test, TestingModule } from '@nestjs/testing';
import { ShortenController } from './shorten.controller';
import { ShortenService } from './shorten.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';

describe('ShortenController', () => {
  let controller: ShortenController;
  let service: ShortenService;

  const mockShortenService = {
    createShortUrl: jest.fn(),
    listByOwner: jest.fn(),
    updateUrl: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenController],
      providers: [
        {
          provide: ShortenService,
          useValue: mockShortenService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(OptionalAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ShortenController>(ShortenController);
    service = module.get<ShortenService>(ShortenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a short URL with authenticated user', async () => {
      const dto: CreateShortUrlDto = {
        originalUrl: 'https://example.com',
      };
      const req = { user: { userId: 1 } };
      const expectedResult = {
        id: 1,
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        userId: 1,
      };

      mockShortenService.createShortUrl.mockResolvedValue(expectedResult);

      const result = await controller.create(dto, req);

      expect(result).toEqual(expectedResult);
      expect(service.createShortUrl).toHaveBeenCalledWith(dto, 1);
      expect(service.createShortUrl).toHaveBeenCalledTimes(1);
    });

    it('should create a short URL without authenticated user', async () => {
      const dto: CreateShortUrlDto = {
        originalUrl: 'https://example.com',
      };
      const req = { user: undefined };
      const expectedResult = {
        id: 1,
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        userId: null,
      };

      mockShortenService.createShortUrl.mockResolvedValue(expectedResult);

      const result = await controller.create(dto, req);

      expect(result).toEqual(expectedResult);
      expect(service.createShortUrl).toHaveBeenCalledWith(dto, undefined);
      expect(service.createShortUrl).toHaveBeenCalledTimes(1);
    });
  });

  describe('listMine', () => {
    it('should return list of URLs for authenticated user', async () => {
      const req = { user: { userId: 1 } };
      const expectedResult = [
        {
          id: 1,
          shortCode: 'abc123',
          originalUrl: 'https://example.com',
          userId: 1,
        },
        {
          id: 2,
          shortCode: 'def456',
          originalUrl: 'https://example2.com',
          userId: 1,
        },
      ];

      mockShortenService.listByOwner.mockResolvedValue(expectedResult);

      const result = await controller.listMine(req);

      expect(result).toEqual(expectedResult);
      expect(service.listByOwner).toHaveBeenCalledWith(1);
      expect(service.listByOwner).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when user has no URLs', async () => {
      const req = { user: { userId: 1 } };
      const expectedResult = [];

      mockShortenService.listByOwner.mockResolvedValue(expectedResult);

      const result = await controller.listMine(req);

      expect(result).toEqual(expectedResult);
      expect(service.listByOwner).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update URL successfully', async () => {
      const id = 1;
      const dto: UpdateUrlDto = {
        originalUrl: 'https://updated-example.com',
      };
      const req = { user: { userId: 1 } };
      const expectedResult = {
        id: 1,
        shortCode: 'abc123',
        originalUrl: 'https://updated-example.com',
        userId: 1,
      };

      mockShortenService.updateUrl.mockResolvedValue(expectedResult);

      const result = await controller.update(id, dto, req);

      expect(result).toEqual(expectedResult);
      expect(service.updateUrl).toHaveBeenCalledWith(id, 1, dto);
      expect(service.updateUrl).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid ID through ParseIntPipe', async () => {
      const dto: UpdateUrlDto = {
        originalUrl: 'https://updated-example.com',
      };
      const req = { user: { userId: 1 } };

      await controller.update(123, dto, req);

      expect(service.updateUrl).toHaveBeenCalledWith(123, 1, dto);
    });
  });

  describe('remove', () => {
    it('should remove URL successfully', async () => {
      const id = 1;
      const req = { user: { userId: 1 } };

      mockShortenService.softDelete.mockResolvedValue(undefined);

      const result = await controller.remove(id, req);

      expect(result).toEqual({ message: 'URL removida com sucesso' });
      expect(service.softDelete).toHaveBeenCalledWith(id, 1);
      expect(service.softDelete).toHaveBeenCalledTimes(1);
    });

    it('should handle removal of non-existent URL', async () => {
      const id = 999;
      const req = { user: { userId: 1 } };

      mockShortenService.softDelete.mockRejectedValue(
        new Error('URL not found'),
      );

      await expect(controller.remove(id, req)).rejects.toThrow(
        'URL not found',
      );
      expect(service.softDelete).toHaveBeenCalledWith(id, 1);
    });
  });
});