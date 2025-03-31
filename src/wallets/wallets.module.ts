import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsService } from './wallets.service';
import { Wallet } from './entities/wallet.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Wallet])],
    providers: [WalletsService],
    exports: [WalletsService],
})
export class WalletsModule { }