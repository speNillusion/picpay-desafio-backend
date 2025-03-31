import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class WalletsService {
    constructor(
        @InjectRepository(Wallet)
        private walletsRepository: Repository<Wallet>,
        private dataSource: DataSource,
    ) { }

    async findByUserId(userId: number): Promise<Wallet> {
        const wallet = await this.walletsRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!wallet) {
            throw new BadRequestException('Wallet not found');
        }
        return wallet;
    }

    async hasEnoughBalance(userId: number, amount: number): Promise<boolean> {
        if (amount <= 0) {
            throw new BadRequestException('Amount must be greater than zero');
        }
        const wallet = await this.findByUserId(userId);
        if (!wallet) {
            throw new BadRequestException('Wallet not found');
        }
        return wallet.balance >= amount;
    }

    async updateBalance(walletId: number, amount: number): Promise<void> {
        await this.walletsRepository.update(walletId, {
            balance: () => `balance + ${amount}`,
        });
    }

    async transferFunds(
        payerWalletId: number,
        payeeWalletId: number,
        amount: number,
    ): Promise<void> {
        if (amount <= 0) {
            throw new BadRequestException('Amount must be greater than zero');
        }

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Verificar saldo antes da transferência
            const payerWallet = await queryRunner.manager.findOne(Wallet, {
                where: { id: payerWalletId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!payerWallet) {
                throw new BadRequestException('Payer wallet not found');
            }

            if (payerWallet.balance < amount) {
                throw new BadRequestException('Insufficient funds');
            }

            const payeeWallet = await queryRunner.manager.findOne(Wallet, {
                where: { id: payeeWalletId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!payeeWallet) {
                throw new BadRequestException('Payee wallet not found');
            }

            // Debitar da carteira do pagador
            await queryRunner.manager.update(
                Wallet,
                { id: payerWalletId },
                { balance: () => `balance - ${amount}` },
            );

            // Creditar na carteira do recebedor
            await queryRunner.manager.update(
                Wallet,
                { id: payeeWalletId },
                { balance: () => `balance + ${amount}` },
            );

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            if (err instanceof BadRequestException) {
                throw err;
            }
            throw new BadRequestException('Failed to transfer funds: ' + err.message);
        } finally {
            await queryRunner.release();
        }
    }
}