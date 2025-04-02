import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { DbMain } from 'src/_database/db.main';

export function CpfUnico(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'CpfUnico',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        async validate(value: any, args: ValidationArguments): Promise<boolean> {
          const db = new DbMain();
        
          try {
            const users = await db.getDb();
            return !users.some(user => user.cpf === value);
          } catch (error) {
            console.error('Erro ao verificar cpf no banco de dados:', error);
            return false;
          }
        },
        defaultMessage() {
          return 'O CPF já existe';
        }
      }
    });
  };
}
