import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const savedUser = await this.userRepository.create({
      email: createUserDto.email,
      password: createUserDto.password,
    });

    return {
      id: savedUser.id,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
    };
  }

  async findAll() {
    return await this.userRepository.findAll();
  }

  async findOne(email: string): Promise<User> {
    return this.userRepository.findByEmail(email);
  }
}
