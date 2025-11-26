import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUrlDto {
  @ApiProperty({
    example: 'https://www.example.com/new/url',
    description: 'Nova URL para atualizar',
  })
  @IsUrl()
  originalUrl: string;
}
