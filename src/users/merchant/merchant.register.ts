import { Controller, Post, Res, Body, Injectable, Get, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { CommonRegister } from "../common/common.register";
import { DbMain } from "src/_database/db.main";
import { PwdEncrypt } from "../DTO/dto.password";
import { Cripto } from "../DTO/dto.cripto";
import { TokenService } from "src/token/token";
import { RegisterDto } from "../DTO/dto.register";

@Controller("/merchant")
@Injectable()
export class MerchantRegister extends CommonRegister {
    constructor() {
        super(new DbMain, new PwdEncrypt, new Cripto, new TokenService);
    }

    @Post('/register')
    async merchantRegister(
        @Body() data: RegisterDto,
        @Res() res: Response) {
            const { type } = data;
            /* if data have type so compare if type is merchant else redirect to commonRegister */
            if (type?.toLowerCase() !== 'merchant') {
                return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
                    statusCode: HttpStatus.METHOD_NOT_ALLOWED,
                    message: 'To create a common user, use /common/register'
                });
            }
            return await this.register(data, res);
    }

    @Get('/register')
    async merchantGetregister(
        @Res() res: Response
    ) {
        return await this.getRegister(res);
    }
}