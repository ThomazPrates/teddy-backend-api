import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const savedUser = await this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
    });

    const authResult = await this.authService.signIn(
      savedUser.email,
      hashedPassword,
    );

    return {
      id: savedUser.id,
      email: savedUser.email,
      ...authResult,
    };
  }

  async findAll() {
    return await this.userRepository.findAll();
  }

  async findOne(email: string): Promise<User> {
    return this.userRepository.findByEmail(email);
  }
}
