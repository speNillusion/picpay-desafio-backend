import { Controller, Get, Post } from "@nestjs/common";

@Controller()
export class AppController {
  constructor() {}

  @Get()
  @Post()
  getMessage(): Promise<string> {
    return Promise.resolve('Server is running!');
  }
  
}