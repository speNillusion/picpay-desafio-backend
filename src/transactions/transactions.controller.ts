import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransferDto } from './dto/transfer.dto';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post('transfer')
    @HttpCode(HttpStatus.OK)
    async transfer(@Body() transferDto: TransferDto) {
        const transaction = await this.transactionsService.transfer(transferDto);
        return {
            id: transaction.id,
            value: transaction.value,
            payer: transaction.payer.id,
            payee: transaction.payee.id,
            status: transaction.status,
            createdAt: transaction.createdAt,
        };
    }
}