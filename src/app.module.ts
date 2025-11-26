import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { getDatabaseConfig } from './database/config';
import { AuthModule } from './auth/auth.module';
import { ShortenModule } from './shorten/shorten.module';
import { RedirectModule } from './redirect/redirect.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
      load: [() => ({
        app: {
          baseUrl: process.env.BASE_URL || process.env.API_URL || 'http://localhost:3000',
          port: parseInt(process.env.PORT || '3000', 10),
          nodeEnv: process.env.NODE_ENV || 'development',
        },
      })],
    }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    UserModule,
    AuthModule,
    ShortenModule,
    RedirectModule,
  ],
})
export class AppModule {}
