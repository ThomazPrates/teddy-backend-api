import { Module } from '@nestjs/common';
import { RedirectController } from './redirect.controller';
import { RedirectService } from './redirect.service';
import { ShortenModule } from '../shorten/shorten.module';

@Module({
  imports: [ShortenModule],
  controllers: [RedirectController],
  providers: [RedirectService],
})
export class RedirectModule {}
