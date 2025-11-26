import { ApiProperty } from '@nestjs/swagger';

export class CreateUserResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID do usuário criado',
  })
  id: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email do usuário',
  })
  email: string;

  @ApiProperty({
    example: 'jwt.token.here',
    description: 'Token JWT de acesso',
  })
  access_token: string;
}
