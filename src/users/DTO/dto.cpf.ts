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
          if (!value) return false;
          
          const db = new DbMain();
          
          try {
            const responseCpf = await db.cpfNotRepeat(value);

            if (responseCpf) {
              return false;
            } else {
              const users = await db.getDb();
              return !users.some(user => user.cpf === value);
            }
          } catch (error) {
            console.error('Error checking CPF in database:', error);
            return false;
          }
        },
        defaultMessage() {
          return 'CPF already exists';
        }
      }
    });
  };
}
