import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { Link, Click, User } from '../entities';
import { CreateLinkDto } from '../dto/link.dto';

import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linkRepository: Repository<Link>,
    @InjectRepository(Click)
    private clickRepository: Repository<Click>,

    @InjectQueue('click-processing')
    private clickQueue: Queue,
  ) {}

  async createLink(createLinkDto: CreateLinkDto, user: User) {

  // Generate unique short code
  let short_url: string = "";
  let isUnique = false;
  
  while (!isUnique) {
    short_url = nanoid(8);
    const existingLink = await this.linkRepository.findOne({
      where: { short_url: short_url }
    });
    isUnique = !existingLink;
  }

  const link = this.linkRepository.create({
    userId: user.id,  
    long_url: createLinkDto.long_url,
    short_url: short_url,
  });

  const savedLink = await this.linkRepository.save(link);

  return {
    id: savedLink.id,
    long_url: savedLink.long_url,
    short_url: savedLink.short_url,
    createdAt: savedLink.createdAt,
  };
}

  async findUserLinks(user: User) {
    
    const links = await this.linkRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });

    // Get click counts for each link
    const linksWithCounts = await Promise.all(
      links.map(async (link) => {
        const clickCount = await this.clickRepository.count({
          where: { linkId: link.id }
        });

        return {
          id: link.id,
          long_url: link.long_url,
          short_url: `http://localhost:3000/${link.short_url}`,
          createdAt: link.createdAt,
          // expiresAt: link.expiresAt,
          click_count: clickCount,
        };
      })
    );

    return linksWithCounts;
  }

  
  async redirectToLongUrl(short_url: string, clickData: any) {
    const link = await this.linkRepository.findOne({
        where: { short_url: short_url }
    });

    if (!link) {
        throw new NotFoundException('Short link not found');
    }

    // Queue the click processing
    const job = await this.clickQueue.add('process-click', {
      linkId: link.id,
      clickData: {
        browser: clickData.browser || 'Unknown',
        ip: clickData.ip || 'Unknown',
        location: clickData.location || '',
        timestamp: new Date().toISOString(),
      }
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    // const click = this.clickRepository.create({
    //     linkId: link.id,  
    //     browser: clickData.browser || '',
    //     ip: clickData.ip || '',
    //     location: clickData.location || '',
    // });

    // const savedClick = await this.clickRepository.save(click);
    return link.long_url;
    }


  async getUserClicks(user: User) {
    const clicks = await this.clickRepository
        .createQueryBuilder('click')
        .leftJoinAndSelect('click.link', 'link')
        .where('link.userId = :userId', { userId: user.id })
        .orderBy('click.createdAt', 'DESC')
        .getMany();
    return clicks;
  }

  async getClicksByLink(linkId: number, user: User) {

    // Verify link belongs to user
    const link = await this.linkRepository.findOne({
        where: { id: linkId, userId: user.id }
    });

    if (!link) {
        throw new NotFoundException('Link not found');
    }

    const clickCount = await this.clickRepository.count({
        where: { linkId: linkId }
    });

    
    return { link_id: linkId, click_count: clickCount };
  }


  async getClickDetail(clickId: number, user: User) {

    const click = await this.clickRepository
      .createQueryBuilder('click')
      .leftJoinAndSelect('click.link', 'link')
      .where('click.id = :clickId', { clickId })
      .andWhere('link.user_id = :userId', { userId: user.id })
      .getOne();

    if (!click) {
      throw new NotFoundException('Click detail not found');
    }

    return click;
  }
}
