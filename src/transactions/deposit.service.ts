import { Injectable, Headers, HttpStatus, Controller, Post, Body, Res, Get } from '@nestjs/common';
import { DbMain } from 'src/_database/db.main';
import { Response } from "express";
import { TransferDto } from '../users/DTO/dto.transfer';
import { CommonLogin } from 'src/users/common/common.login';
import { TokenService } from 'src/token/token';
import { Cripto } from 'src/users/DTO/dto.cripto';
import { DepositDto } from 'src/users/DTO/dto.deposit';

@Controller('/deposit')
@Injectable()
export class DepositService extends CommonLogin {
    private readonly cripto: Cripto;

    constructor(
        protected readonly tokenService: TokenService,
        protected readonly dbmain: DbMain,
        cripto: Cripto
    ) {
        super(tokenService, dbmain);
        this.cripto = cripto;
    }

    @Get()
    async depositGet(
        @Res() res: Response
    ): Promise<any> {
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
            statusCode: HttpStatus.METHOD_NOT_ALLOWED,
            message: 'The Route GET is Not Allowed, use POST to do your deposit.'
        });
    }

    public async depositPost(
        @Headers('authorization') token: string,
        @Body() depositDto: DepositDto,
        @Res() res: Response 
    ) {
        return this.deposit(token, depositDto, res);
    }

    @Post()
    private async deposit(
        @Headers('authorization') token: string,
        @Body() depositDto: DepositDto,
        @Res() res: Response
    ) {
        const { account, value } = depositDto;

        // Verificar token de autenticação
        const accessVerify = await this.verifyToken(token);
        if (!accessVerify) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: 'Token inválido'
            });
        }

        try {
            const decrypt = await this.tokenService.decrypt(token.split(' ')[1].trim());
            const parseToken = JSON.parse(decrypt);
            const tokenEmail = parseToken.email;

            const encryptedAccount = await this.cripto.encryptEmail(account);

            // Verificar se o token pertence ao usuário da conta
            if (tokenEmail !== encryptedAccount) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: 'Token inválido para o deposito!'
                });
            }

            // Verificar se o valor é válido
            if (!value || value <= 0) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Valor de depósito inválido'
                });
            }

            // Verificar se a conta existe
            try {
                const accountId = await this.dbmain.getId(encryptedAccount);

                if (!accountId) {
                    return res.status(HttpStatus.NOT_FOUND).json({
                        statusCode: HttpStatus.NOT_FOUND,
                        message: 'Conta não encontrada'
                    });
                }

                // Realizar o depósito
                await this.dbmain.depositByEmail(encryptedAccount, value);

                // Obter o saldo atualizado
                const updatedBalance = await this.dbmain.getWallet(encryptedAccount);

                return res.status(HttpStatus.OK).json({
                    statusCode: HttpStatus.OK,
                    message: 'Depósito realizado com sucesso',
                    value: value,
                    account: account,
                    balance: updatedBalance
                });

            } catch (accountErr) {
                console.error('Erro ao verificar conta:', accountErr);
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'Conta não encontrada'
                });
            }
        } catch (depositErr) {
            console.error('Erro ao processar depósito:', depositErr);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Erro ao processar depósito: ' + depositErr.message
            });
        }
    }

}