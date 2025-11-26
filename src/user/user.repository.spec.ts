import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let repository: Repository<User>;

  const mockTypeOrmRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user when email exists', async () => {
      const email = 'test@example.com';
      const mockUser: User = { id: 1, email, password: 'hashed' } as User;

      mockTypeOrmRepository.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail(email);

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return null when user is not found', async () => {
      const email = 'notfound@example.com';

      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findByEmail(email);

      expect(result).toBeNull();
    });

    it('should propagate errors from TypeORM', async () => {
      mockTypeOrmRepository.findOne.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        userRepository.findByEmail('any@example.com'),
      ).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      const userData = { email: 'new@example.com', password: 'abc123' };
      const mockCreatedUser = { ...userData } as User;
      const mockSavedUser = { id: 1, ...userData } as User;

      mockTypeOrmRepository.create.mockReturnValue(mockCreatedUser);
      mockTypeOrmRepository.save.mockResolvedValue(mockSavedUser);

      const result = await userRepository.create(userData);

      expect(result).toEqual(mockSavedUser);
      expect(repository.create).toHaveBeenCalledWith(userData);
      expect(repository.save).toHaveBeenCalledWith(mockCreatedUser);
    });

    it('should propagate save errors', async () => {
      mockTypeOrmRepository.create.mockReturnValue({});
      mockTypeOrmRepository.save.mockRejectedValue(new Error('Save failed'));

      await expect(userRepository.create({})).rejects.toThrow('Save failed');
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const id = 1;
      const mockUser: User = { id, email: 'x@x.com', password: 'hash' } as User;

      mockTypeOrmRepository.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findById(id);

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
    });

    it('should return null when not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findById(10);

      expect(result).toBeNull();
    });

    it('should propagate errors', async () => {
      mockTypeOrmRepository.findOne.mockRejectedValue(
        new Error('Database failure'),
      );

      await expect(userRepository.findById(1)).rejects.toThrow(
        'Database failure',
      );
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const mockUsers: User[] = [
        { id: 1, email: 'a@a.com', password: 'x' } as User,
        { id: 2, email: 'b@b.com', password: 'y' } as User,
      ];

      mockTypeOrmRepository.find.mockResolvedValue(mockUsers);

      const result = await userRepository.findAll();

      expect(result).toEqual(mockUsers);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([]);

      const result = await userRepository.findAll();

      expect(result).toEqual([]);
    });

    it('should propagate errors', async () => {
      mockTypeOrmRepository.find.mockRejectedValue(new Error('Query failed'));

      await expect(userRepository.findAll()).rejects.toThrow('Query failed');
    });
  });

  describe('update', () => {
    it('should update and return updated user', async () => {
      const id = 1;
      const userData = { email: 'updated@example.com' };
      const updatedUser: User = {
        id,
        email: 'updated@example.com',
        password: 'abc',
      } as User;

      mockTypeOrmRepository.update.mockResolvedValue(undefined);
      jest
        .spyOn(userRepository, 'findById')
        .mockResolvedValue(updatedUser);

      const result = await userRepository.update(id, userData);

      expect(result).toEqual(updatedUser);
      expect(repository.update).toHaveBeenCalledWith(id, userData);
      expect(userRepository.findById).toHaveBeenCalledWith(id);
    });

    it('should propagate update errors', async () => {
      mockTypeOrmRepository.update.mockRejectedValue(
        new Error('Update failed'),
      );

      await expect(userRepository.update(1, {})).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue(undefined);

      await expect(userRepository.delete(1)).resolves.not.toThrow();

      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(repository.delete).toHaveBeenCalledTimes(1);
    });

    it('should propagate delete errors', async () => {
      mockTypeOrmRepository.delete.mockRejectedValue(
        new Error('Delete error'),
      );

      await expect(userRepository.delete(2)).rejects.toThrow('Delete error');
    });
  });
});
