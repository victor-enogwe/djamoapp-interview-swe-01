import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Logger as NestJsLogger,
  LoggerModule as PinoLoggerModule,
  type Params,
} from 'nestjs-pino';

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<Params> => {
        const isProd = config.getOrThrow<string>('NODE_ENV') === 'production';

        return Promise.resolve({
          pinoHttp: {
            level: !isProd ? 'error' : 'info',
            transport: isProd
              ? undefined
              : { target: 'pino-pretty', options: { colorize: true } },
          },
        });
      },
    }),
  ],
  providers: [{ provide: Logger, useClass: NestJsLogger }],
  exports: [Logger],
})
export class LoggerModule {}
