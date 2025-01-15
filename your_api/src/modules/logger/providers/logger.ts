import type { Logger } from 'nestjs-pino';
import { PinoLogger } from 'nestjs-pino';

export const logger = new Proxy(
  new PinoLogger({
    pinoHttp: {
      level: 'info',
      transport: { target: 'pino-pretty', options: { colorize: true } },
    },
  }),
  {
    get(...args): unknown {
      const [target, prop] = args;

      if (prop === 'log') return target.info.bind(target);

      return Reflect.get(...args) as unknown;
    },
  },
) as unknown as PinoLogger & Pick<Logger, 'log'>;
