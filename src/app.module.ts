import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Link, Click, User } from './entities';
import { AuthModule } from './auth/auth.module';
import { LinksService } from './links/links.service';
import { LinksController } from './links/links.controller';
import { LinksModule } from './links/links.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH || 'db.sqlite',
      // entities: [__dirname + '/**/*.entity{.ts,.npm run start:devjs}'],
      entities: [Link, Click, User], // entities for database schema
      synchronize: true,
      logging: true,
    }),
    QueueModule,
    AuthModule,
    LinksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
