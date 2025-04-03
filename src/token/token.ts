import { Injectable } from '@nestjs/common';
import { Cripto } from 'src/users/DTO/dto.cripto';

@Injectable()
export class TokenService extends Cripto {
    constructor() {
        /* inheritance initited to provite imports on constructor */
        super();
    }

    public tokenToUser = async (data: string) => {
        const token = await this.encryptEmail(data);
        return token;
    }

}