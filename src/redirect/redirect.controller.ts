import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { RedirectService } from './redirect.service';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RedirectResponseDto } from './dto/redirect-response.dto';

@ApiTags('redirect')
@Controller('redirect')
export class RedirectController {
  constructor(private readonly redirectService: RedirectService) {}

  @Get(':code')
  @ApiParam({
    name: 'code',
    required: true,
    description: 'Código da URL encurtada',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirecionamento para a URL original',
    type: RedirectResponseDto,
  })
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const url = await this.redirectService.getOriginalUrl(code);
    return res.redirect(url);
  }
}
