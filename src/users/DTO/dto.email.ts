import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { DbMain } from 'src/_database/db.main';
import { Cripto } from './dto.cripto';

export function EmailUnico(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'EmailUnico',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const db = new DbMain();
          const emailEncrypted = await new Cripto().encryptEmail(value);
          try {

            const users = await db.getDb();
            return !users.some(user => user.email === emailEncrypted);
          } catch (error) {
            console.error('Erro ao verificar email no banco de dados:', error);
            return false;
          }
        },
        defaultMessage() {
          return 'O email já existe';
        }
      }
    });
  };
}
