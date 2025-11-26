import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ShortenService } from './shorten.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';

@Controller('shorten')
export class ShortenController {
  constructor(private readonly shortenService: ShortenService) {}

  @UseGuards(OptionalAuthGuard)
  @Post()
  async create(@Body() dto: CreateShortUrlDto, @Request() req: any) {
    return this.shortenService.createShortUrl(dto, req.user?.userId);
  }

  @UseGuards(AuthGuard)
  @Get('my-urls')
  async listMine(@Request() req: any) {
    return this.shortenService.listByOwner(req.user.userId);
  }

  @UseGuards(AuthGuard)
  @Put('my-urls/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUrlDto,
    @Request() req: any,
  ) {
    return this.shortenService.updateUrl(id, req.user.userId, dto);
  }

  @UseGuards(AuthGuard)
  @Delete('my-urls/:id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    await this.shortenService.softDelete(id, req.user.userId);
    return { message: 'URL removida com sucesso' };
  }
}
