import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { RedirectService } from './redirect.service';

@Controller()
export class RedirectController {
  constructor(private readonly redirectService: RedirectService) {}

  @Get(':code')
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const url = await this.redirectService.getOriginalUrl(code);
    return res.redirect(url);
  }
}
