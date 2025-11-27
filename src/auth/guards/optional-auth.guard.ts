import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      request['user'] = undefined;
      return true;
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token);
      
      const userId = payload.sub || payload.userId;
      
      if (!userId) {
        request['user'] = undefined;
        return true;
      }
      
      request['user'] = {
        userId: userId,
        email: payload.email,
        ...payload,
      };
    } catch (error) {
      request['user'] = undefined;
    }
    
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
