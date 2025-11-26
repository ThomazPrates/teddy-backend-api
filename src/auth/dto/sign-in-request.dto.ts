import { ApiProperty } from '@nestjs/swagger';

export class SignInRequestDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email do usuário',
  })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Senha do usuário',
  })
  password: string;
}
