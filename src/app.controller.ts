import { Controller, Get, HttpStatus, Post, Res, Body, Inject } from "@nestjs/common";
import { HttpCode } from "@nestjs/common";
import { Response } from "express";
import { checkDb } from "./_database/db.check";
import { CommonRegister } from "./users/common/common.register";
import { MerchantRegister } from "./users/merchant/merchant.register";
import { RegisterDto } from "./users/DTO/dto.register";
import { DbMain } from "./_database/db.main";
import { PwdEncrypt } from "./users/DTO/dto.password";
import { Cripto } from "./users/DTO/dto.cripto";
import { TokenService } from "./token/token";

@Controller()
export class AppController {
  constructor(
    private readonly commonRegister: CommonRegister,
    private readonly merchantRegister: MerchantRegister
  ) {
    this.commonRegister = new CommonRegister(new DbMain, new PwdEncrypt, new Cripto, new TokenService);
    this.merchantRegister = new MerchantRegister();
  }

  /* server */
  @Get('/server')
  @HttpCode(HttpStatus.OK)
  async serverRes(
    @Res() res: Response
  ): Promise<object> {
    const testDb = await checkDb();

    if (!testDb) {
      return Promise.reject(
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Erro ao conectar ao banco de dados',
          }
        ));
    };

    return Promise.resolve(
      res.status(HttpStatus.OK).json(
        {
          statusCode: HttpStatus.OK,
          message: 'Conexão e Tabelas OK',
        }
      ));
  };

  @Post('/server')
  async serverResPost(
    @Res() res: Response
  ) {
    await this.serverRes(res);
  }
  /* server */



  /* common User */
  @Post('/common/register')
  async commonRes(
    @Body() data: RegisterDto,
    @Res() res: Response
  ) {
    return await this.commonRegister.register(data, res);
  }

  @Get('/common/register')
  async commonResGet(
    @Res() res: Response
  ) {
    return await this.commonRegister.getRegister(res);
  }
  /* common User */



  /* merchant User */
  @Post('/merchant/register')
  async merchantRes(
    @Body() data: RegisterDto,
    @Res() res: Response
  ) {
    return Promise.resolve(
      res.status(HttpStatus.OK).json(
        {
          statusCode: HttpStatus.OK,
          message: await this.merchantRegister.merchantRegister(data,res),
        }
      ));
  }

  @Get('/merchant/register')
  async merchantResGet(
    @Res() res: Response
  ) {
    await this.merchantRegister.merchantGetregister(res);
  }
  /* merchant User */



}