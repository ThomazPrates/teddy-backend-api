import { ApiProperty } from '@nestjs/swagger';

export class SignInResponseDto {
  @ApiProperty({
    example: 'jwt.token.here',
    description: 'Token JWT de acesso',
  })
  access_token: string;

  @ApiProperty({
    example: '1d',
    description: 'Tempo de expiração do token',
  })
  expiresIn: string;
}
