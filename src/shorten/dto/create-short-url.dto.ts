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
    example: 'customAlias123',
    description: 'Alias opcional para a URL encurtada',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/)
  @Length(SHORT_CODE_LENGTH, SHORT_CODE_LENGTH)
  alias?: string;
}
