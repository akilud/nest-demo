import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ClickProcessor } from './click.processor';
import { Click } from '../entities/clicks.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'click-processing',
    }),
    TypeOrmModule.forFeature([Click]),
  ],
  providers: [ClickProcessor],
  exports: [BullModule],
})
export class QueueModule {}
