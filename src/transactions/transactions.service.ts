import { Injectable, BadRequestException, UnauthorizedException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { TransferDto } from './dto/transfer.dto';
import { UsersService } from '../users/users.service';
import { WalletsService } from '../wallets/wallets.service';
import { ExternalService } from '../external/external.service';
import { UserType } from '../users/entities/user.entity';

@Injectable()
export class TransactionsService {
    private readonly logger = new Logger(TransactionsService.name);

    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        private usersService: UsersService,
        private walletsService: WalletsService,
        private externalService: ExternalService,
        private dataSource: DataSource,
    ) { }

    async transfer(transferDto: TransferDto): Promise<Transaction> {
        const { value, payer, payee } = transferDto;

        // Verificar se o pagador e o recebedor existem
        const payerUser = await this.usersService.findById(payer);
        const payeeUser = await this.usersService.findById(payee);

        // Verificar se o pagador não é um lojista
        if (payerUser.type === UserType.MERCHANT) {
            throw new BadRequestException('Merchants cannot send money');
        }

        // Verificar se o pagador tem saldo suficiente
        const hasBalance = await this.walletsService.hasEnoughBalance(payer, value);
        if (!hasBalance) {
            throw new BadRequestException('Insufficient funds');
        }

        // Criar a transação com status pendente
        const transaction = this.transactionsRepository.create({
            value,
            payer: payerUser,
            payee: payeeUser,
            status: TransactionStatus.PENDING,
        });

        // Iniciar transação no banco de dados
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Salvar a transação
            const savedTransaction = await queryRunner.manager.save(transaction);

            // Consultar serviço autorizador externo
            const isAuthorized = await this.externalService.authorizeTransaction();
            if (!isAuthorized) {
                throw new UnauthorizedException('Transaction not authorized by external service');
            }

            // Transferir o dinheiro
            await this.walletsService.transferFunds(
                payerUser.wallet.id,
                payeeUser.wallet.id,
                value,
            );

            // Atualizar status da transação para completada
            savedTransaction.status = TransactionStatus.COMPLETED;
            await queryRunner.manager.save(savedTransaction);

            // Commit da transação
            await queryRunner.commitTransaction();

            // Enviar notificação (não bloqueia a transação)
            this.externalService
                .notifyUser(
                    payeeUser.email,
                    `You received a transfer of ${value} from ${payerUser.fullName}`,
                )
                .catch((error) => {
                    this.logger.error(`Failed to send notification: ${error.message}`);
                });

            return savedTransaction;
        } catch (error) {
            // Rollback em caso de erro
            await queryRunner.rollbackTransaction();

            // Atualizar status da transação para falha
            transaction.status = TransactionStatus.FAILED;
            transaction.failureReason = error.message;
            await this.transactionsRepository.save(transaction);

            if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error;
            }

            this.logger.error(`Transaction failed: ${error.message}`);
            throw new InternalServerErrorException('Failed to process transaction');
        } finally {
            // Liberar o query runner
            await queryRunner.release();
        }
    }
}