import { IsOptional, IsString, IsUrl, Length, Matches } from 'class-validator';
import { SHORT_CODE_LENGTH } from '../../shared/utils/short-code.util';

export class CreateShortUrlDto {
  @IsUrl()
  originalUrl: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/)
  @Length(SHORT_CODE_LENGTH, SHORT_CODE_LENGTH)
  alias?: string;
}

