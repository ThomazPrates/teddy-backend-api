import { Test, TestingModule } from '@nestjs/testing';
import { RedirectController } from './redirect.controller';
import { RedirectService } from './redirect.service';

describe('RedirectController', () => {
  let controller: RedirectController;
  let service: RedirectService;

  const mockRedirectService = {
    getOriginalUrl: jest.fn(),
  };

  const mockResponse = () => {
    const res: any = {};
    res.redirect = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedirectController],
      providers: [
        {
          provide: RedirectService,
          useValue: mockRedirectService,
        },
      ],
    }).compile();

    controller = module.get<RedirectController>(RedirectController);
    service = module.get<RedirectService>(RedirectService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('redirect', () => {
    it('should redirect to the original URL', async () => {
      const code = 'abc123';
      const originalUrl = 'https://example.com';
      const res = mockResponse();

      mockRedirectService.getOriginalUrl.mockResolvedValue(originalUrl);

      const result = await controller.redirect(code, res);

      expect(service.getOriginalUrl).toHaveBeenCalledWith(code);
      expect(res.redirect).toHaveBeenCalledWith(originalUrl);
      expect(result).toEqual(res);
    });

    it('should propagate service errors', async () => {
      const code = 'invalid';
      const res = mockResponse();
      const error = new Error('Not found');

      mockRedirectService.getOriginalUrl.mockRejectedValue(error);

      await expect(controller.redirect(code, res)).rejects.toThrow('Not found');
      expect(service.getOriginalUrl).toHaveBeenCalledWith(code);
    });
  });
});
