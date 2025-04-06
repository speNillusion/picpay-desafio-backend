import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class TransferDto {
    @IsNotEmpty({ message: 'O Email do pagador é obrigatório' })
    @IsString({ message: 'O Email do pagador deve ser uma string' })
    payer: string;

    @IsNotEmpty({ message: 'O Email do recebedor é obrigatório' })
    @IsString({ message: 'O Email do recebedor deve ser uma string' })
    payee: string;

    @IsNotEmpty({ message: 'O valor da transferência é obrigatório' })
    @IsNumber({}, { message: 'O valor deve ser um número' })
    @IsPositive({ message: 'O valor deve ser positivo' })
    value: number;
}