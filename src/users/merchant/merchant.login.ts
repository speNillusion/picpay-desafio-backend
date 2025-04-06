import { Controller, Post, Headers, Res, Injectable, Get, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { CommonLogin } from "../common/common.login";
import { DbMain } from "src/_database/db.main";
import { TokenService } from "src/token/token";

@Controller('/merchant')
@Injectable()
export class MerchantLogin extends CommonLogin {
    constructor() {
        super(new TokenService(), new DbMain());
    }

    @Post('/login')
    async merchantLogin(
        @Headers('Authorization') token: string,
        @Res() res: Response
    ) {
        
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
            const email = parseToken.email;

           
            const userType = await this.dbmain.getType(email);
            if (userType !== 'merchant') {
                return res.status(HttpStatus.FORBIDDEN).json({
                    statusCode: HttpStatus.FORBIDDEN,
                    message: 'Acesso permitido apenas para lojistas'
                });
            }

            const balance = await this.dbmain.getWallet(email);

            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Login realizado com sucesso',
                type: userType,
                balance: balance
            });
        } catch (error) {
            console.error('Erro ao verificar tipo de usuário:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Erro ao processar login'
            });
        }
    }
}