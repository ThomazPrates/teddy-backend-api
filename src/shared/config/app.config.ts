import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  baseUrl: process.env.BASE_URL || process.env.API_URL || 'http://localhost:3000',
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
}));

