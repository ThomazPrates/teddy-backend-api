import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  private users: Array<{ id: number; email: string; password: string }> = [];
  private nextId = 1;

  async create(createUserDto: CreateUserDto) {
    const existingUser = this.users.find(
      (user) => user.email === createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const user = {
      id: this.nextId++,
      email: createUserDto.email,
      password: createUserDto.password, // Em produção, usar hash de senha
    };

    this.users.push(user);

    return {
      id: user.id,
      email: user.email,
    };
  }
}

