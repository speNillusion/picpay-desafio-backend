import { Body, Controller, Post, HttpStatus, Res, Inject, Injectable } from "@nestjs/common";
import { RegisterDto } from "../DTO/dto.register";
import { Response } from "express";
import { DbMain } from "src/_database/db.main";
import { PwdEncrypt } from "../DTO/dto.password";
import { Cripto } from "../DTO/dto.cripto";

@Controller('/common')
@Injectable()
export class CommonRegister {
    constructor(
        private readonly dbmain: DbMain,
        private readonly hashPassword: PwdEncrypt,
        private readonly hashEmail: Cripto
    ) {
        this.dbmain = new DbMain();
        this.hashEmail = new Cripto();
        this.hashPassword = new PwdEncrypt();
     }

    @Post('/register')
    async register(
        @Body() data: RegisterDto,
        @Res() res: Response
    ) {
        const { name, email, cpf, pass, type } = data;

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

            /* after create user, send to response a message 201 created with successfuly message */

            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
                message: 'User registered successfully',
                type: type
            });

        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Error registering user',
                error: error.message
            });
        }
    }
}