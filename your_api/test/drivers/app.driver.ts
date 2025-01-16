import compression from '@fastify/compress';
import { ShutdownSignal } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { TestingModule } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';

export class AppDriver {
  constructor(private readonly moduleFixture: TestingModule) {}

  async createNestApplication(): Promise<NestFastifyApplication> {
    const shutdownHooks: ShutdownSignal[] = [
      ShutdownSignal.SIGTERM,
      ShutdownSignal.SIGINT,
      ShutdownSignal.SIGHUP,
      ShutdownSignal.SIGQUIT,
      ShutdownSignal.SIGQUIT,
      ShutdownSignal.SIGABRT,
    ];

    const app =
      this.moduleFixture.createNestApplication<NestFastifyApplication>(
        new FastifyAdapter({
          onProtoPoisoning: 'error',
          onConstructorPoisoning: 'error',
          requestIdHeader: false,
          ignoreTrailingSlash: true,
          ignoreDuplicateSlashes: true,
          disableRequestLogging: true,
          genReqId: (): string => randomUUID(),
          logger: {
            level: 'silent',
            timestamp: true,
            name: 'http-request',
            transport: {
              target: 'pino-pretty',
              options: { colorize: true },
            },
          },
        }),
        {
          bufferLogs: true,
          rawBody: true,
          forceCloseConnections: true,
          abortOnError: false,
          bodyParser: true,
        },
      );

    app.useLogger(app.get(Logger));

    app.enableShutdownHooks(shutdownHooks);

    const configService = app.get(ConfigService);
    const origins = configService.get<string>('CORS_ORIGINS') ?? '';
    const origin = origins.split(',');

    app.enableCors({
      origin,
      allowedHeaders: ['content-type'],
      methods: ['GET', 'POST'],
      exposedHeaders: [],
      credentials: false,
    });

    await app.register(compression, { encodings: ['gzip', 'deflate'] });

    return app;
  }
}
