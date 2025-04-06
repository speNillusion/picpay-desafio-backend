import { Controller, Get, HttpStatus, Post, Res, Body, Headers } from "@nestjs/common";
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
import { CommonLogin } from "./users/common/common.login";
import { TransactionService } from "./transactions/transaction.service";
import { DepositService } from "./transactions/deposit.service";
import { TransferDto } from "./users/DTO/dto.transfer";
import { DepositDto } from "./users/DTO/dto.deposit";
import { MerchantLogin } from "./users/merchant/merchant.login";

@Controller()
export class AppController extends TransactionService {
  constructor(
    private readonly commonRegister: CommonRegister,
    private readonly merchantRegister: MerchantRegister,
    private readonly commonLogin: CommonLogin,
    private readonly merchantLogin: MerchantLogin,
    private readonly depositService: DepositService,
  ) {
    super(new TokenService, new DbMain, new Cripto);
    this.commonRegister = new CommonRegister(new DbMain, new PwdEncrypt, new Cripto, new TokenService);
    this.merchantRegister = new MerchantRegister();
    this.commonLogin = new CommonLogin(new TokenService, new DbMain);
    this.merchantLogin = new MerchantLogin();
    this.depositService = new DepositService(new TokenService, new DbMain, new Cripto);
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

  @Post('/common/login')
  async commonLog(
    @Headers('Authorization') token: string,
    @Res() res: Response
  ) {
    return await this.commonLogin.login(token, res);
  }

  @Get('/common/login')
  async commonLogGet(
    @Headers('Authorization') token: string,
    @Res() res: Response
  ) {
    return await this.commonLogin.login(token, res);
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
          message: await this.merchantRegister.merchantRegister(data, res),
        }
      ));
  }

  @Get('/merchant/register')
  async merchantResGet(
    @Res() res: Response
  ) {
    await this.merchantRegister.merchantGetregister(res);
  }

  @Post('/merchant/login')
  async merchantLog(
    @Headers('Authorization') token: string,
    @Res() res: Response
  ) {
    return await this.merchantLogin.merchantLogin(token, res);
  }

  @Get('/merchant/login')
  async merchantLogGet(
    @Headers('Authorization') token: string,
    @Res() res: Response
  ) {
    return await this.merchantLogin.merchantLogin(token, res);
  }


  /* merchant User */


  /* Transactions */
  @Post('/transactions/transfer')
  async dotransfer(
    @Headers('Authorization') token: string,
    @Body() transferDto: TransferDto,
    @Res() res: Response
  ) {
    return await this.transfer(token, transferDto, res);
  };

  @Get('/transactions/transfer')
  async dotransferGet(
    @Res() res: Response
  ) {
    return await this.transferGet(res);
  }

  @Post('/transactions/deposit')
  async doDeposit(
    @Headers('Authorization') token: string,
    @Body() depositDto: DepositDto,
    @Res() res: Response
  ) {
    return await this.depositService.depositPost(token, depositDto, res);
  };

  @Get('/transactions/deposit')
  async doDepositGet(
    @Res() res: Response
  ) {
    return await this.depositService.depositGet(res);
  }
  /* Transactions */

}