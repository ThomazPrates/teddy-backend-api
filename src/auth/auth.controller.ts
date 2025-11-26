import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({ type: SignInRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Login bem-sucedido',
    type: SignInResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  signIn(@Body() signInRequestDto: SignInRequestDto): Promise<SignInResponseDto> {
    return this.authService.signIn(signInRequestDto.email, signInRequestDto.password);
  }
}
