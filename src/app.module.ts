import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DbMain } from './_database/db.main';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true
      }
    ),
  ],
  controllers: [
    AppController
  ],
  providers: [
    DbMain,
  ]
})
export class AppModule { }
