import { Injectable, ValidationPipe } from '@nestjs/common';
import { Class } from '../../../@types/utils.module';

@Injectable()
export class Validator {
  constructor(private validationPipe: ValidationPipe) {}

  async data<T extends object, R extends Class<object>>(
    context: T,
    dto: R,
  ): Promise<R['prototype']> {
    const value = (await this.validationPipe.transform(context, {
      type: 'custom',
      metatype: dto,
    })) as R;

    return value;
  }
}
