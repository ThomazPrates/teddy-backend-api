import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { AuthService } from '../auth/auth.service';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let authService: AuthService;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  };

  const mockAuthService = {
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserRequestDto = {
        email: 'user@example.com',
        password: 'Password123!',
      };

      const hashedPassword = 'hashedPassword123';
      const savedUser: User = {
        id: 1,
        email: 'user@example.com',
        password: hashedPassword,
      } as User;

      const authResult = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      };

      const expectedResponse: CreateUserResponseDto = {
        id: 1,
        email: 'user@example.com',
        access_token: authResult.access_token,
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(savedUser);
      mockAuthService.signIn.mockResolvedValue(authResult);

      const result = await service.create(createUserDto);

      expect(result).toEqual(expectedResponse);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        password: hashedPassword,
      });
      expect(authService.signIn).toHaveBeenCalledWith(
        savedUser.email,
        createUserDto.password,
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto: CreateUserRequestDto = {
        email: 'existing@example.com',
        password: 'Password123!',
      };

      const existingUser: User = {
        id: 1,
        email: 'existing@example.com',
        password: 'hashedPassword',
      } as User;

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Email já cadastrado',
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(authService.signIn).not.toHaveBeenCalled();
    });

    it('should hash password with bcrypt using salt rounds of 10', async () => {
      const createUserDto: CreateUserRequestDto = {
        email: 'hash@example.com',
        password: 'PlainPassword123!',
      };

      const hashedPassword = '$2b$10$hashedPasswordExample';
      const savedUser: User = {
        id: 2,
        email: 'hash@example.com',
        password: hashedPassword,
      } as User;

      mockUserRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(savedUser);
      mockAuthService.signIn.mockResolvedValue({
        access_token: 'token123',
      });

      await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('PlainPassword123!', 10);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    });

    it('should sign in user with original password after creation', async () => {
      const createUserDto: CreateUserRequestDto = {
        email: 'signin@example.com',
        password: 'Password123!',
      };

      const hashedPassword = 'hashedPassword456';
      const savedUser: User = {
        id: 3,
        email: 'signin@example.com',
        password: hashedPassword,
      } as User;

      mockUserRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(savedUser);
      mockAuthService.signIn.mockResolvedValue({
        access_token: 'newToken789',
      });

      await service.create(createUserDto);

      expect(authService.signIn).toHaveBeenCalledWith(
        'signin@example.com',
        createUserDto.password, // Senha original, não hasheada
      );
      expect(authService.signIn).toHaveBeenCalledTimes(1);
    });

    it('should include auth result in response', async () => {
      const createUserDto: CreateUserRequestDto = {
        email: 'auth@example.com',
        password: 'Password123!',
      };

      const hashedPassword = 'hashedPassword789';
      const savedUser: User = {
        id: 4,
        email: 'auth@example.com',
        password: hashedPassword,
      } as User;

      const authResult = {
        access_token: 'jwt.token.here',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(savedUser);
      mockAuthService.signIn.mockResolvedValue(authResult);

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        id: savedUser.id,
        email: savedUser.email,
        access_token: authResult.access_token,
      });
      expect(result.access_token).toBe(authResult.access_token);
    });

    it('should propagate repository errors', async () => {
      const createUserDto: CreateUserRequestDto = {
        email: 'error@example.com',
        password: 'Password123!',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Database error',
      );
    });

    it('should propagate auth service errors', async () => {
      const createUserDto: CreateUserRequestDto = {
        email: 'autherror@example.com',
        password: 'Password123!',
      };

      const hashedPassword = 'hashedPassword';
      const savedUser: User = {
        id: 5,
        email: 'autherror@example.com',
        password: hashedPassword,
      } as User;

      mockUserRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(savedUser);
      mockAuthService.signIn.mockRejectedValue(
        new Error('Authentication failed'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Authentication failed',
      );
    });
  });

  describe('findAll', () => {
    it('should return array of all users', async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          email: 'user1@example.com',
          password: 'hashedPassword1',
        } as User,
        {
          id: 2,
          email: 'user2@example.com',
          password: 'hashedPassword2',
        } as User,
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return user when found by email', async () => {
      const email = 'found@example.com';
      const mockUser: User = {
        id: 1,
        email,
        password: 'hashedPassword',
      } as User;

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findOne(email);

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
    });

    it('should return null when user not found', async () => {
      const email = 'notfound@example.com';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findOne(email);

      expect(result).toBeNull();
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should handle repository errors', async () => {
      const email = 'error@example.com';

      mockUserRepository.findByEmail.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findOne(email)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});