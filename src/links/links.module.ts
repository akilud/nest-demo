import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';
import { Link, Click } from '../entities';
import { AuthModule } from '../auth/auth.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Link, Click]),
    AuthModule,
    QueueModule,
  ],
  controllers: [LinksController],
  providers: [LinksService],
})
export class LinksModule {}
