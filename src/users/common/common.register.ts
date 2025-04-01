import { Controller } from "@nestjs/common";

@Controller('/common/register')
export class CommonRegister {
    register(): string {
        return "Common Register";
    }
}