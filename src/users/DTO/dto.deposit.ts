import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class DepositDto {
    @IsNotEmpty({ message: 'O Email de deposito é obrigatório' })
    @IsString({ message: 'O Email de deposito deve ser uma string' })
    account: string;

    @IsNotEmpty({ message: 'O valor da deposito é obrigatório' })
    @IsNumber({}, { message: 'O valor deve ser um número' })
    @IsPositive({ message: 'O valor deve ser positivo' })
    value: number;
}