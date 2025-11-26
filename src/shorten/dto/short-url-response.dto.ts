import { ApiProperty } from '@nestjs/swagger';

export class ShortUrlResponseDto {
  @ApiProperty({ example: 1, description: 'ID da URL encurtada' })
  id: number;

  @ApiProperty({ example: 'https://www.example.com/very/long/url', description: 'URL original' })
  originalUrl: string;

  @ApiProperty({ example: 'https://short.ly/customAlias123', description: 'URL encurtada' })
  shortUrl: string;

  @ApiProperty({ example: 'customAlias123', description: 'Alias da URL' })
  alias?: string;

  @ApiProperty({ example: 42, description: 'ID do usuário proprietário da URL', required: false })
  ownerId?: number;
}
