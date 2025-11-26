import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './entities/url.entity';

@Injectable()
export class ShortenRepository {
  constructor(
    @InjectRepository(Url)
    private readonly repo: Repository<Url>,
  ) {}

  create(data: Partial<Url>): Url {
    return this.repo.create(data);
  }

  save(url: Url): Promise<Url> {
    return this.repo.save(url);
  }

  findByShortCode(shortCode: string): Promise<Url | null> {
    return this.repo.findOne({ 
      where: { shortCode },
    });
  }

  findByShortCodeCaseInsensitive(shortCode: string): Promise<Url | null> {
    return this.repo
      .createQueryBuilder('url')
      .where('LOWER(url.shortCode) = LOWER(:shortCode)', { shortCode })
      .andWhere('url.deletedAt IS NULL')
      .getOne();
  }

  findWithDeleted(shortCode: string): Promise<Url> {
    return this.repo.findOne({
      where: { shortCode },
      withDeleted: true,
    });
  }

  listByOwner(ownerId: number): Promise<Url[]> {
    return this.repo.find({
      where: { owner: { id: ownerId } },
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: number): Promise<Url> {
    return this.repo.findOne({
      where: { id },
      relations: ['owner'],
    });
  }

  softDelete(url: Url): Promise<Url> {
    return this.repo.softRemove(url);
  }
}
