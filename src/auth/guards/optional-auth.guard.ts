import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Injectable()
export class OptionalAuthGuard extends AuthGuard {
  handleRequest(err, user) {
    // Se falhar autenticação, retorna undefined, NÃO lança erro
    if (err || !user) {
      return undefined;
    }
    return user;
  }
}
