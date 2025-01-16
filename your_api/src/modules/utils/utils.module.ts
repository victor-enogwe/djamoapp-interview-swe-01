import { Global, Module, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { UtilsService } from './services/utils.service';

@Global()
@Module({
  providers: [
    UtilsService,
    {
      provide: ValidationPipe,
      inject: [ConfigService, UtilsService],
      useFactory: (
        configService: ConfigService,
        utilsService: UtilsService,
      ): ValidationPipe => {
        const NODE_ENV = configService.getOrThrow<string>('NODE_ENV');
        const isProd = NODE_ENV === 'production';

        return new ValidationPipe({
          enableDebugMessages: !isProd,
          disableErrorMessages: isProd,
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
          transform: true,
          stopAtFirstError: true,
          validateCustomDecorators: true,
          validationError: { target: false, value: true },
          exceptionFactory: (error) => utilsService.exceptionFactory(error),
        });
      },
    },
    {
      provide: APP_PIPE,
      useExisting: ValidationPipe,
    },
  ],
  exports: [UtilsService, ValidationPipe],
})
export class UtilsModule {}
