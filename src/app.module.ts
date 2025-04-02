import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DbMain } from './_database/db.main';
import { CommonRegister } from './users/common/common.register';
import { MerchantRegister } from './users/merchant/merchant.register';

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
    CommonRegister,
    MerchantRegister,
  ]
})
export class AppModule { }
