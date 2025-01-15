import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { get } from 'lodash';
import { Class } from '../../@types/utils.module';

@Injectable()
export class UtilsService {
  exceptionFactory([error]: ValidationError[]): HttpException {
    const { property, contexts = {}, constraints = {} } = error;
    const [key] = Object.keys(constraints);
    const message = get(constraints, key, 'unknown error');

    const Exception = get(
      contexts,
      `${key}.exception`,
      BadRequestException,
    ) as Class<HttpException>;

    return new Exception({ property, message });
  }
}
