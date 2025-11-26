import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signIn', () => {
    it('should call AuthService.signIn with correct params', async () => {
      const dto = { email: 'john', password: '123456' };
      const mockResponse = { access_token: 'abc123' };

      mockAuthService.signIn.mockResolvedValue(mockResponse);

      const result = await authController.signIn(dto);

      expect(result).toEqual(mockResponse);
      expect(authService.signIn).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
    });

    it('should propagate errors thrown by AuthService', async () => {
      const dto = { email: 'john', password: 'wrong' };
      mockAuthService.signIn.mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(authController.signIn(dto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
