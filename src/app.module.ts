import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DbMain } from './_database/db.main';
import { CommonRegister } from './users/common/common.register';
import { MerchantRegister } from './users/merchant/merchant.register';
import { Cripto } from './users/DTO/dto.cripto';
import { PwdEncrypt } from './users/DTO/dto.password';
import { TokenService } from './token/token';
import { CommonLogin } from './users/common/common.login';
import { MerchantLogin } from './users/merchant/merchant.login';
import { TransactionService } from './transactions/transaction.service';
import { DepositService } from './transactions/deposit.service';

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
    Cripto,
    PwdEncrypt,
    TokenService,
    CommonLogin,
    MerchantLogin,
    TransactionService,
    DepositService,
  ]
})
export class AppModule { }
