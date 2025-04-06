/* 
    1° create a func to make login:
       -> func login(@Header('Authorization') token: string, @Res() res: Response): 
                --> that function will receive the token from the header,
                ---> and will verify if the token is valid, verifying if email and pass r valids to login,
                ---> if the token is invalid, the function will return a response with the status code 401,
                ---> if the token is valid, the function will return a response with the status code 200;
                --> if 200, the function will return the balance of the user;
*/

import { Controller, Post, HttpStatus, Headers, Res, Injectable } from "@nestjs/common";
import { Response } from "express";
import { DbMain } from "src/_database/db.main";
import { TokenService } from "src/token/token";

@Controller('/common')
@Injectable()
export class CommonLogin {

    constructor(
        protected readonly tokenService: TokenService,
        protected readonly dbmain: DbMain
    ) {
        this.tokenService = new TokenService();
        this.dbmain = new DbMain();
    };
    
    @Post('/login')
    async login(
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
            if (userType !== 'common') {
                return res.status(HttpStatus.FORBIDDEN).json({
                    statusCode: HttpStatus.FORBIDDEN,
                    message: 'Acesso permitido apenas para usuários comuns'
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

    protected async verifyToken(token: string) {
        try {
            let decrypt = await this.tokenService.decrypt(token.split(' ')[1].trim());
            let parseToken = JSON.parse(decrypt);
            const email = parseToken.email;
            const pass = parseToken.pass;

            if (!email || !pass) { throw new Error('Token inválido') }

            return await this.dbmain.verifyEmailPass(email, pass);
        } catch (verifyErr) {
            console.error(verifyErr);
            return false;
        }
    };
}