import { Controller, Get, HttpStatus, Post, Res } from "@nestjs/common";
import { HttpCode } from "@nestjs/common";
import { Response } from "express";
import { checkDb } from "./_database/db.check";
import { CommonRegister } from "./users/common/common.register";
import { MerchantRegister } from "./users/merchant/merchant.register";

@Controller()
export class AppController {
  constructor() {}

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
    @Res() res: Response  
  ) {
    return Promise.resolve(
      res.status(HttpStatus.OK).json(
        {
      statusCode: HttpStatus.OK,
      message: new CommonRegister().register(),
    }
  ));
  }

  @Get('/common/register')
  async commonResGet(
    @Res() res: Response 
  ) {
    await this.commonRes(res);
  }
  /* common User */



  /* merchant User */
  @Post('/merchant/register')
  async merchantRes(
    @Res() res: Response  
  ) {
    return Promise.resolve(
      res.status(HttpStatus.OK).json(
        {
      statusCode: HttpStatus.OK,
      message: new MerchantRegister().register(),
    }
  ));
  }

  @Get('/merchant/register')
  async merchantResGet(
    @Res() res: Response 
  ) {
    await this.merchantRes(res);
  }
  /* merchant User */
  
}