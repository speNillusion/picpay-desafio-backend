import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ExternalModule } from './external/external.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UsersModule,
    WalletsModule,
    TransactionsModule,
    ExternalModule,
  ],
})
export class AppModule { }
