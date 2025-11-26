import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortenService } from './shorten.service';
import { ShortenController } from './shorten.controller';
import { ShortenRepository } from './shorten.repository';
import { Url } from './entities/url.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Url]), AuthModule],
  controllers: [ShortenController],
  providers: [ShortenService, ShortenRepository],
  exports: [ShortenService],
})
export class ShortenModule {}
