import { Controller } from "@nestjs/common";

Controller("/merchant/register")
export class MerchantRegister {
    async register(): Promise<any> {
        return "Merchant Register";
    }
}