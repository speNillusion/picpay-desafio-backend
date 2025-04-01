import { Controller } from "@nestjs/common";

Controller("/merchant/register")
export class MerchantRegister {
    register(): string {
        return "Merchant Register";
    }
}