import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";
import { EmailUnico } from "./dto.email";
import { CpfUnico } from "./dto.cpf";
import { TypeSpecific } from "./dto.type";

export class RegisterDto {
  @IsString({ message: "Nome invalido"})
  @IsNotEmpty({ message: "Corpo Vazio"} )
  name: string;

  @IsEmail(undefined, { message: "Email invalido" })
  @EmailUnico({ message: "O email já existe "})
  @IsNotEmpty({ message: "Corpo Vazio"} )
  email: string;

  @IsString({ message: "Senha invalida" })
  @MinLength(6, { message: "Senha precisa ter pelo menos 6 characters" })
  @IsNotEmpty({ message: "Corpo Vazio"} )
  pass: string;

  @IsNotEmpty({ message: "Corpo Vazio"} )
  @IsNumber(undefined, {message: "CPF invalido"})
  @CpfUnico()
  cpf: number;

  @IsNotEmpty({ message: "Corpo Vazio"} )
  @IsString({message: "CPF invalido"})
  @TypeSpecific({ message: "O type deve ser merchant ou common"})
  type: string;
}