import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ExternalService {
    private readonly logger = new Logger(ExternalService.name);
    private readonly authorizeUrl: string;
    private readonly notifyUrl: string;

    constructor(private configService: ConfigService) {
        const authorizeUrlConfig = this.configService.get<string>('AUTHORIZE_SERVICE_URL');
        if (!authorizeUrlConfig) {
            throw new Error('AUTHORIZE_SERVICE_URL is not configured');
        }
        this.authorizeUrl = authorizeUrlConfig;
        const notifyUrlConfig = this.configService.get<string>('NOTIFY_SERVICE_URL');
        if (!notifyUrlConfig) {
            throw new Error('NOTIFY_SERVICE_URL is not configured');
        }
        this.notifyUrl = notifyUrlConfig;
    }

    async authorizeTransaction(): Promise<boolean> {
        try {
            const response = await axios.get(this.authorizeUrl);
            return response.data?.message === 'Autorizado';
        } catch (error) {
            this.logger.error(`Error authorizing transaction: ${error.message}`);
            return false;
        }
    }

    async notifyUser(email: string, message: string): Promise<boolean> {
        try {
            await axios.post(this.notifyUrl, {
                email,
                message,
            });
            return true;
        } catch (error) {
            this.logger.error(`Error notifying user: ${error.message}`);
            // Não falha a transação se a notificação falhar
            return false;
        }
    }
}