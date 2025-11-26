import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { CreateUserResponseDto } from './dto/create-user-response.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserRequestDto = {
        email: 'user@example.com',
        password: 'Password123!',
      };

      const expectedResponse: CreateUserResponseDto = {
        id: 1,
        email: 'user@example.com',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      };

      mockUserService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResponse);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should create user and return access token', async () => {
      const createUserDto: CreateUserRequestDto = {
        email: 'token@example.com',
        password: 'Password123!',
      };

      const expectedResponse: CreateUserResponseDto = {
        id: 2,
        email: 'token@example.com',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token',
      };

      mockUserService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResponse);
      expect(result.access_token).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should propagate service errors', async () => {
      const createUserDto: CreateUserRequestDto = {
        email: 'duplicate@example.com',
        password: 'Password123!',
      };

      const error = new Error('Email already exists');
      mockUserService.create.mockRejectedValue(error);

      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Email already exists',
      );
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle validation errors from service', async () => {
      const createUserDto: CreateUserRequestDto = {
        email: 'invalid-email',
        password: 'weak',
      };

      const validationError = new Error('Invalid email format');
      mockUserService.create.mockRejectedValue(validationError);

      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Invalid email format',
      );
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should return response with correct structure', async () => {
      const createUserDto: CreateUserRequestDto = {
        email: 'structure@example.com',
        password: 'Password123!',
      };

      const expectedResponse: CreateUserResponseDto = {
        id: 3,
        email: 'structure@example.com',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.structure.token',
      };

      mockUserService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createUserDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('access_token');
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('name');
      expect(result).not.toHaveProperty('createdAt');
      expect(typeof result.id).toBe('number');
      expect(typeof result.email).toBe('string');
      expect(typeof result.access_token).toBe('string');
    });
  });
});