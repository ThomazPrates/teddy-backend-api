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
  
  @Controller()
  export class ShortenController {
    constructor(private readonly shortenService: ShortenService) {}
  
    @UseGuards(AuthGuard)
    @Post('shorten')
    async create(@Body() dto: CreateShortUrlDto, @Request() req: any) {
      const ownerId = req.user?.userId;
      return this.shortenService.createShortUrl(dto, ownerId);
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
    async remove(
      @Param('id', ParseIntPipe) id: number,
      @Request() req: any,
    ) {
      await this.shortenService.softDelete(id, req.user.userId);
      return { message: 'URL removida com sucesso' };
    }
  }
  
  