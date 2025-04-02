import { Body, Controller, Post, HttpStatus, Res } from "@nestjs/common";
import { RegisterDto } from "../DTO/dto.register";
import { DbMain } from "src/_database/db.main";
import { Response } from "express";

@Controller('/common')
export class CommonRegister {

    @Post('/register')
    async register(
        @Body() data: RegisterDto,
        @Res() res: Response
    ) {
        const { name, email, cpf, pass, type } = data;
        const db = new DbMain();

        try {
            if (cpf.toString().length !== 11) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Invalid CPF'
                });
            }
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
                message: 'User registered successfully',
                data: {
                    name,
                    email,
                    cpf,
                    pass,
                    type
                }
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