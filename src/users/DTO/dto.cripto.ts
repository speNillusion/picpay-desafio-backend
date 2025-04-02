import { Injectable } from "@nestjs/common";

@Injectable()
export class Cripto {

    constructor() {}
    // Método estático para criptografar o email
    async encryptEmail(email: string): Promise<string>  {
        return Buffer.from(email, 'ascii').toString('base64');
    }

    async decrypt(email: string): Promise<string> {
        return Buffer.from(email, 'base64').toString('ascii');
    }
}

