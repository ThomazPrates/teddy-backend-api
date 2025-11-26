import { ApiProperty } from '@nestjs/swagger';

export class RedirectResponseDto {
  @ApiProperty({
    description: 'URL original para a qual será feito o redirecionamento',
    example: 'https://example.com',
  })
  location: string;

  @ApiProperty({
    description: 'Código de status HTTP do redirecionamento',
    example: 302,
  })
  status: number;
}
