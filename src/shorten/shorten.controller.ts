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
import { ShortUrlResponseDto } from './dto/short-url-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Shorten')
@Controller('shorten')
export class ShortenController {
  constructor(private readonly shortenService: ShortenService) {}

  @UseGuards(OptionalAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criar uma URL encurtada' })
  @ApiBody({ type: CreateShortUrlDto })
  @ApiResponse({ status: 201, description: 'URL criada com sucesso', type: ShortUrlResponseDto })
  async create(@Body() dto: CreateShortUrlDto, @Request() req: any) {
    return this.shortenService.createShortUrl(dto, req.user?.userId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('my-urls')
  @ApiOperation({ summary: 'Listar URLs do usuário logado' })
  @ApiResponse({ status: 200, description: 'Lista de URLs do usuário', type: [ShortUrlResponseDto] })
  async listMine(@Request() req: any) {
    return this.shortenService.listByOwner(req.user.userId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Put('my-urls/:id')
  @ApiOperation({ summary: 'Atualizar uma URL do usuário logado' })
  @ApiBody({ type: UpdateUrlDto })
  @ApiResponse({ status: 200, description: 'URL atualizada com sucesso', type: ShortUrlResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUrlDto,
    @Request() req: any,
  ) {
    return this.shortenService.updateUrl(id, req.user.userId, dto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Delete('my-urls/:id')
  @ApiOperation({ summary: 'Remover uma URL do usuário logado' })
  @ApiResponse({ status: 200, description: 'URL removida com sucesso', schema: { example: { message: 'URL removida com sucesso' } } })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    await this.shortenService.softDelete(id, req.user.userId);
    return { message: 'URL removida com sucesso' };
  }
}
