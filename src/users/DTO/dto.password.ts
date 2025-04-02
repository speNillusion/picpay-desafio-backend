import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class PwdEncrypt {

    constructor() {}

    public async crypt(password: string, security: number = 1): Promise<string> {
        let hashs = password;
        for (let i = 0; i < security; i++) {
            hashs = createHash('sha256').update(hashs.toString()).digest('hex');
        }
        return Promise.resolve(hashs);
    };
}
