import { Body, Controller, Post, HttpStatus, Res, Injectable, Get } from "@nestjs/common";
import { RegisterDto } from "../DTO/dto.register";
import { Response } from "express";
import { DbMain } from "src/_database/db.main";
import { PwdEncrypt } from "../DTO/dto.password";
import { Cripto } from "../DTO/dto.cripto";
import { TokenService } from "src/token/token";

@Controller('/common')
@Injectable()
export class CommonRegister {
    constructor(
        protected readonly dbmain: DbMain,
        protected readonly hashPassword: PwdEncrypt,
        protected readonly hashEmail: Cripto,
        protected readonly accessToken: TokenService
    ) {
        this.dbmain = new DbMain();
        this.hashEmail = new Cripto();
        this.hashPassword = new PwdEncrypt();
        this.accessToken = new TokenService();
     }

    @Post('/register')
    async register(
        @Body() data: RegisterDto,
        @Res() res: Response
    ) {
        const { name, email, cpf, pass, type } = data;

        if (type !== 'common') {
            return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
                statusCode: HttpStatus.METHOD_NOT_ALLOWED,
                message: 'To create a merchant user, use /merchant/register'
            });
        }

        /* encrypted args */
        const hashEmail = await this.hashEmail.encryptEmail(email);
        const hashPass = await this.hashPassword.crypt(pass);

        try {
            /* verify if cpf have obrigatory eleven digits */
            if (cpf.toString().length !== 11) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Invalid CPF'
                });
            };

            const cpfnotRepeat = await this.dbmain.cpfNotRepeat(cpf);

            if (cpfnotRepeat) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Cpf Already Exists'
                });
            } else {
                /* create user using dbmain methods */
                const dbmain = new DbMain();
                const createUser = await dbmain.pushDb(name, hashEmail, hashPass, cpf, type);
                /* verify if createUser is true, else return error and reason */
                if (!createUser) {
                    return res.status(HttpStatus.BAD_REQUEST).json({
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'Error registering user',
                        error: 'User already exists'
                    }); 
                };
            }

            const tokenData = {
                email: hashEmail,
                pass: hashPass
            };

            const access = await this.accessToken.tokenToUser(JSON.stringify(tokenData));

            /* Future Simple Method to receipe token and decrypt on login user --> JSON.parse(await this.accessToken.decrypt(access)); */

            /* after create user, send to response a message 201 created with successfuly message */
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
                message: 'User registered successfully',
                type: type,
                token: access
            });

        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Error registering user',
                error: error.message
            });
        }
    }

    @Get('/register')
    async getRegister(
        @Res() res: Response
    ): Promise<any> {
        return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
            statusCode: HttpStatus.METHOD_NOT_ALLOWED,
            message: 'The Route GET is Not Allowed, use POST to register your user.'
        });
    }
}