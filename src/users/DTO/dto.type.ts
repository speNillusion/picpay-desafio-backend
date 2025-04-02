import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function TypeSpecific(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'TypeSpecific',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        async validate(value: any, args: ValidationArguments): Promise<any>  {
          try {
            if (typeof value === 'string') {
             if (value.toLowerCase() === "common" || value.toLowerCase() === "merchant") {
              return true;
             } else {
              return false;
             }
            } else {
              return false;
            }
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
