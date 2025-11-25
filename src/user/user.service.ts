import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';

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
      password: createUserDto.password, // Em produção, usar hash de senha
    });

    return {
      id: savedUser.id,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
    };
  }
}

