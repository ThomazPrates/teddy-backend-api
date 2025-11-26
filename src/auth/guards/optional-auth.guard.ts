import { Injectable } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Injectable()
export class OptionalAuthGuard extends AuthGuard {
  handleRequest(err, user) {
    if (err || !user) {
      return undefined;
    }
    return user;
  }
}
