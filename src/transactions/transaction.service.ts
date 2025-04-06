import { Injectable, Headers, HttpStatus, Controller, Post, Body, Res, Get } from '@nestjs/common';
import { DbMain } from 'src/_database/db.main';
import axios from 'axios';
import { Response } from "express";
import { TransferDto } from '../users/DTO/dto.transfer';
import { CommonLogin } from 'src/users/common/common.login';
import { TokenService } from 'src/token/token';
import { Cripto } from 'src/users/DTO/dto.cripto';

@Controller('/transactions')
@Injectable()
export class TransactionService extends CommonLogin {
    private readonly cripto: Cripto;

    constructor(
        protected readonly tokenService: TokenService,
        protected readonly dbmain: DbMain,
        cripto: Cripto
    ) {
        super(tokenService, dbmain);
        this.cripto = cripto;
    }

    @Get('/transactions/transfer')
    async transferGet(
        @Res() res: Response
    ): Promise<any> {
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
            statusCode: HttpStatus.METHOD_NOT_ALLOWED,
            message: 'The Route GET is Not Allowed, use POST to do your transfer.'
        });
    }

    private readonly AUTHORIZE_SERVICE_URL = process.env.AUTHORIZE_SERVICE_URL;
    private readonly NOTIFY_SERVICE_URL = process.env.NOTIFY_SERVICE_URL;

    @Post('/transactions/transfer')
    protected async transfer(
        @Headers('authorization') token: string,
        @Body() transferDto: TransferDto,
        @Res() res: Response
    ) {
        const { payer, payee, value } = transferDto;

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

            const encryptedPayer = await this.cripto.encryptEmail(payer);

            if (tokenEmail !== encryptedPayer) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: 'Token inválido para o pagador!'
                });
            }

            const payerType = await this.dbmain.getType(encryptedPayer);
            const payerId = await this.dbmain.getId(encryptedPayer);
            const encryptedPayee = await this.cripto.encryptEmail(payee);
            const payeeId = await this.dbmain.getId(encryptedPayee);

            if (payerType === "merchant") {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: 'Usuário do tipo merchant não pode realizar transferências, somente receber!'
                });
            }

            if (!this.AUTHORIZE_SERVICE_URL) {
                throw new Error('AUTHORIZE_SERVICE_URL não está configurado');
            }
            if (!this.NOTIFY_SERVICE_URL) {
                throw new Error('NOTIFY_SERVICE_URL não está configurado');
            }

            const payerBalance = await this.dbmain.getWallet(encryptedPayer);
            if (payerBalance < value) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Saldo insuficiente para realizar a transferência'
                });
            }

            const verification = await axios.get(this.AUTHORIZE_SERVICE_URL, {
                headers: {
                    Authorization: `Bearer ${token.split(' ')[1].trim()}`
                }
            });            

            if (verification && verification.status === 200) {
                const transfer = await this.dbmain.transferAmmount(encryptedPayer, encryptedPayee, value);
                if (!transfer) {
                    return res.status(HttpStatus.BAD_REQUEST).json({
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'Erro ao realizar transferência'
                    });
                }

                try {
                    await axios.post(this.NOTIFY_SERVICE_URL, {
                        payerId: payerId,
                        payeeId: payeeId,
                        value: value
                    });

                } catch (notifyError) {
                    console.error('Erro ao notificar transferência:', notifyError.message);
                }

                return res.status(HttpStatus.OK).json({
                    statusCode: HttpStatus.OK,
                    message: 'Transferência realizada com sucesso!',
                    value: value,
                    payer: payer,
                    payee: payee
                });
            } else {
                return res.status(HttpStatus.BAD_GATEWAY).json({
                    statusCode: HttpStatus.BAD_GATEWAY,
                    message: 'Erro na verificação de autorização, serviço externo indisponível',
                });
            }
        } catch (transferErr) {
            console.error('Erro ao processar transferência:', transferErr);
            return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
                statusCode: HttpStatus.TOO_MANY_REQUESTS,
                message: 'Try again'
            });
        }
    }

}