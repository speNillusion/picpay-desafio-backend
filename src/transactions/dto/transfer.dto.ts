import { IsNumber, IsPositive, IsInt, Min } from 'class-validator';

export class TransferDto {
    @IsNumber()
    @IsPositive()
    value: number;

    @IsInt()
    @Min(1)
    payer: number;

    @IsInt()
    @Min(1)
    payee: number;
}