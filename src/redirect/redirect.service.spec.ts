import { Test, TestingModule } from '@nestjs/testing';
import { RedirectService } from './redirect.service';
import { ShortenService } from '../shorten/shorten.service';

describe('RedirectService', () => {
  let service: RedirectService;
  let shortenService: ShortenService;

  const mockShortenService = {
    trackAccess: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedirectService,
        {
          provide: ShortenService,
          useValue: mockShortenService,
        },
      ],
    }).compile();

    service = module.get<RedirectService>(RedirectService);
    shortenService = module.get<ShortenService>(ShortenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOriginalUrl', () => {
    it('should return the original URL', async () => {
      const code = 'abc123';
      const mockResponse = { originalUrl: 'https://example.com' };

      mockShortenService.trackAccess.mockResolvedValue(mockResponse);

      const result = await service.getOriginalUrl(code);

      expect(result).toEqual(mockResponse.originalUrl);
      expect(shortenService.trackAccess).toHaveBeenCalledWith(code);
      expect(shortenService.trackAccess).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from shortenService', async () => {
      const code = 'invalid';
      const error = new Error('URL not found');

      mockShortenService.trackAccess.mockRejectedValue(error);

      await expect(service.getOriginalUrl(code)).rejects.toThrow('URL not found');
      expect(shortenService.trackAccess).toHaveBeenCalledWith(code);
    });
  });
});
