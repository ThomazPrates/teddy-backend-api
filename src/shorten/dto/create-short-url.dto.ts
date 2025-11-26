import { IsOptional, IsString, IsUrl, Length, Matches } from 'class-validator';
import { SHORT_CODE_LENGTH } from '../../shared/helpers/short-code.helper';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShortUrlDto {
  @ApiProperty({
    example: 'https://www.example.com/very/long/url',
    description: 'URL original que será encurtada',
  })
  @IsUrl()
  originalUrl: string;

  @ApiProperty({
    example: 'meu-link',
    description: 'Alias opcional para a URL encurtada (3-30 caracteres, apenas [a-z0-9_-])',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_-]{3,30}$/i, {
    message: 'Alias deve ter entre 3 e 30 caracteres e conter apenas letras minúsculas, números, hífen e underscore',
  })
  alias?: string;
}
