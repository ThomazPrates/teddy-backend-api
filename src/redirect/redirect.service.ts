import { Injectable } from '@nestjs/common';
import { ShortenService } from '../shorten/shorten.service';

@Injectable()
export class RedirectService {
  constructor(private readonly shortenService: ShortenService) {}

  async getOriginalUrl(code: string) {
    const url = await this.shortenService.trackAccess(code);
    return url.originalUrl;
  }
}