import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
//   Response, 
  Res, 
  Req 
} from '@nestjs/common';
import { Response } from 'express';
import { LinksService } from './links.service';
import { CreateLinkDto } from '../dto/link.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller()
export class LinksController {
  constructor(private linksService: LinksService) {}

  @Post('new')
  @UseGuards(JwtAuthGuard)
  async createLink(@Body() createLinkDto: CreateLinkDto, @Request() req) {
    return this.linksService.createLink(createLinkDto, req.user);
  }

  @Get('links')
  @UseGuards(JwtAuthGuard)
  async getUserLinks(@Request() req) {
    return this.linksService.findUserLinks(req.user);
  }

  @Get('clicks')
  @UseGuards(JwtAuthGuard)
  async getUserClicks(@Request() req) {
    return this.linksService.getUserClicks(req.user);
  }

  @Get('clicks/:link_id')
  @UseGuards(JwtAuthGuard)
  async getClicksByLink(@Param('link_id') linkId: string, @Request() req) {
    return this.linksService.getClicksByLink(+linkId, req.user);
  }

  @Get('click_detail/:click_id')
  @UseGuards(JwtAuthGuard)
  async getClickDetail(@Param('click_id') clickId: string, @Request() req) {
    return this.linksService.getClickDetail(+clickId, req.user);
  }

  @Get(':short_url')
  async redirect(
    @Param('short_url') shortUrl: string, 
    @Res() res: any,
    @Req() req: any
  ) {
    // Extract request metadata
    const clickData = {
      browser: req.headers['user-agent'] || '',
      
      // Extract IP
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',

      // later - use ip to fetch location
      location: '',
    };

    try {
      const longUrl = await this.linksService.redirectToLongUrl(shortUrl, clickData);
      return res.redirect(longUrl);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }
}
