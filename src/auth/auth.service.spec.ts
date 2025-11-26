import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    const email = 'user@example.com';
    const password = 'Password123!';

    it('should sign in successfully', async () => {
      const user = {
        id: 1,
        email,
        password: 'hashedPassword',
      };

      mockUserService.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const jwtResponse = 'jwt_token_123';
      mockJwtService.signAsync.mockResolvedValue(jwtResponse);

      const result = await authService.signIn(email, password);

      expect(result).toEqual({
        access_token: jwtResponse,
        expiresIn: '1d',
      });

      expect(userService.findOne).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: user.id,
          email: user.email,
        },
        { expiresIn: '1d' },
      );
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(authService.signIn(email, password)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(userService.findOne).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      const user = {
        id: 1,
        email,
        password: 'hashedPassword',
      };

      mockUserService.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.signIn(email, password)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should propagate errors from userService', async () => {
      mockUserService.findOne.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(authService.signIn(email, password)).rejects.toThrow(
        'Database error',
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should propagate errors from jwtService', async () => {
      const user = {
        id: 1,
        email,
        password: 'hashedPassword',
      };

      mockUserService.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      mockJwtService.signAsync.mockRejectedValue(
        new Error('JWT failure'),
      );

      await expect(authService.signIn(email, password)).rejects.toThrow(
        'JWT failure',
      );
    });
  });
});
