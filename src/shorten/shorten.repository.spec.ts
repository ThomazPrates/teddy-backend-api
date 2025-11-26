import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortenRepository } from './shorten.repository';
import { Url } from './entities/url.entity';
import { User } from '../user/entities/user.entity';

describe('ShortenRepository', () => {
  let repository: ShortenRepository;
  let typeormRepository: Repository<Url>;

  const mockTypeormRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenRepository,
        {
          provide: getRepositoryToken(Url),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get<ShortenRepository>(ShortenRepository);
    typeormRepository = module.get<Repository<Url>>(getRepositoryToken(Url));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new URL entity', () => {
      const data: Partial<Url> = {
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        owner: { id: 1 } as User,
      };

      const mockUrl = {
        ...data,
        id: 1,
        accessCount: 0,
      } as Url;

      mockTypeormRepository.create.mockReturnValue(mockUrl);

      const result = repository.create(data);

      expect(result).toEqual(mockUrl);
      expect(typeormRepository.create).toHaveBeenCalledWith(data);
      expect(typeormRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should create URL without owner', () => {
      const data: Partial<Url> = {
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
      };

      const mockUrl = {
        ...data,
        id: 1,
        accessCount: 0,
        owner: undefined,
      } as Url;

      mockTypeormRepository.create.mockReturnValue(mockUrl);

      const result = repository.create(data);

      expect(result).toEqual(mockUrl);
      expect(typeormRepository.create).toHaveBeenCalledWith(data);
    });
  });

  describe('save', () => {
    it('should save URL entity', async () => {
      const url = {
        id: 1,
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        accessCount: 0,
      } as Url;

      mockTypeormRepository.save.mockResolvedValue(url);

      const result = await repository.save(url);

      expect(result).toEqual(url);
      expect(typeormRepository.save).toHaveBeenCalledWith(url);
      expect(typeormRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should save URL with updated fields', async () => {
      const url = {
        id: 1,
        shortCode: 'abc123',
        originalUrl: 'https://updated-example.com',
        accessCount: 10,
      } as Url;

      mockTypeormRepository.save.mockResolvedValue(url);

      const result = await repository.save(url);

      expect(result).toEqual(url);
      expect(result.originalUrl).toBe('https://updated-example.com');
      expect(result.accessCount).toBe(10);
    });
  });

  describe('findByShortCode', () => {
    it('should find URL by short code', async () => {
      const shortCode = 'abc123';
      const mockUrl = {
        id: 1,
        shortCode,
        originalUrl: 'https://example.com',
        accessCount: 5,
      } as Url;

      mockTypeormRepository.findOne.mockResolvedValue(mockUrl);

      const result = await repository.findByShortCode(shortCode);

      expect(result).toEqual(mockUrl);
      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { shortCode },
      });
      expect(typeormRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when URL not found', async () => {
      const shortCode = 'nonexistent';

      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByShortCode(shortCode);

      expect(result).toBeNull();
      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { shortCode },
      });
    });
  });

  describe('findWithDeleted', () => {
    it('should find URL including soft-deleted records', async () => {
      const shortCode = 'abc123';
      const mockUrl = {
        id: 1,
        shortCode,
        originalUrl: 'https://example.com',
        deletedAt: new Date(),
      } as Url;

      mockTypeormRepository.findOne.mockResolvedValue(mockUrl);

      const result = await repository.findWithDeleted(shortCode);

      expect(result).toEqual(mockUrl);
      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { shortCode },
        withDeleted: true,
      });
      expect(typeormRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should find active URL when using withDeleted', async () => {
      const shortCode = 'abc123';
      const mockUrl = {
        id: 1,
        shortCode,
        originalUrl: 'https://example.com',
        deletedAt: null,
      } as Url;

      mockTypeormRepository.findOne.mockResolvedValue(mockUrl);

      const result = await repository.findWithDeleted(shortCode);

      expect(result).toEqual(mockUrl);
      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { shortCode },
        withDeleted: true,
      });
    });

    it('should return null when URL not found even with withDeleted', async () => {
      const shortCode = 'nonexistent';

      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findWithDeleted(shortCode);

      expect(result).toBeNull();
    });
  });

  describe('listByOwner', () => {
    it('should return list of URLs for owner ordered by creation date', async () => {
      const ownerId = 1;
      const mockUrls = [
        {
          id: 2,
          shortCode: 'def456',
          originalUrl: 'https://example2.com',
          owner: { id: ownerId } as User,
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 1,
          shortCode: 'abc123',
          originalUrl: 'https://example.com',
          owner: { id: ownerId } as User,
          createdAt: new Date('2024-01-01'),
        },
      ] as Url[];

      mockTypeormRepository.find.mockResolvedValue(mockUrls);

      const result = await repository.listByOwner(ownerId);

      expect(result).toEqual(mockUrls);
      expect(typeormRepository.find).toHaveBeenCalledWith({
        where: { owner: { id: ownerId } },
        order: { createdAt: 'DESC' },
      });
      expect(typeormRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when owner has no URLs', async () => {
      const ownerId = 1;

      mockTypeormRepository.find.mockResolvedValue([]);

      const result = await repository.listByOwner(ownerId);

      expect(result).toEqual([]);
      expect(typeormRepository.find).toHaveBeenCalledWith({
        where: { owner: { id: ownerId } },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findById', () => {
    it('should find URL by ID with owner relations', async () => {
      const id = 1;
      const mockUrl = {
        id,
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        owner: {
          id: 1,
          email: 'user@example.com',
        } as User,
      } as Url;

      mockTypeormRepository.findOne.mockResolvedValue(mockUrl);

      const result = await repository.findById(id);

      expect(result).toEqual(mockUrl);
      expect(result.owner).toBeDefined();
      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['owner'],
      });
      expect(typeormRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should find URL by ID without owner', async () => {
      const id = 1;
      const mockUrl = {
        id,
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        owner: null,
      } as Url;

      mockTypeormRepository.findOne.mockResolvedValue(mockUrl);

      const result = await repository.findById(id);

      expect(result).toEqual(mockUrl);
      expect(result.owner).toBeNull();
    });

    it('should return null when URL not found by ID', async () => {
      const id = 999;

      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById(id);

      expect(result).toBeNull();
      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['owner'],
      });
    });
  });

  describe('softDelete', () => {
    it('should soft delete URL entity', async () => {
      const url = {
        id: 1,
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        deletedAt: null,
      } as Url;

      const deletedUrl = {
        ...url,
        deletedAt: new Date(),
      } as Url;

      mockTypeormRepository.softRemove.mockResolvedValue(deletedUrl);

      const result = await repository.softDelete(url);

      expect(result).toEqual(deletedUrl);
      expect(typeormRepository.softRemove).toHaveBeenCalledWith(url);
      expect(typeormRepository.softRemove).toHaveBeenCalledTimes(1);
    });

    it('should handle soft delete of URL with owner', async () => {
      const url = {
        id: 1,
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        owner: { id: 1 } as User,
        deletedAt: null,
      } as Url;

      const deletedUrl = {
        ...url,
        deletedAt: new Date(),
      } as Url;

      mockTypeormRepository.softRemove.mockResolvedValue(deletedUrl);

      const result = await repository.softDelete(url);

      expect(result).toEqual(deletedUrl);
      expect(result.deletedAt).toBeDefined();
    });
  });
});