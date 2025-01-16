import compression from '@fastify/compress';
import { ShutdownSignal } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { AppModule } from './modules/app/app.module';

export async function bootstrap(): Promise<NestFastifyApplication> {
  const testMode = process.env['NODE_ENV'] === 'test';

  const fastifyApp = new FastifyAdapter({
    onProtoPoisoning: 'error',
    onConstructorPoisoning: 'error',
    requestIdHeader: false,
    ignoreTrailingSlash: true,
    ignoreDuplicateSlashes: true,
    disableRequestLogging: testMode,
    logger: {
      level: testMode ? 'silent' : 'info',
      timestamp: true,
      name: 'http-request',
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    },
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyApp,
    {
      bufferLogs: true,
      rawBody: true,
      forceCloseConnections: true,
      abortOnError: false,
      bodyParser: true,
    },
  );

  app.useLogger(app.get(Logger));

  app.enableShutdownHooks([
    ShutdownSignal.SIGTERM,
    ShutdownSignal.SIGINT,
    ShutdownSignal.SIGHUP,
    ShutdownSignal.SIGQUIT,
    ShutdownSignal.SIGQUIT,
    ShutdownSignal.SIGABRT,
  ]);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost3100'],
    allowedHeaders: ['content-type'],
    methods: ['GET', 'POST'],
    exposedHeaders: [],
    credentials: false,
  });

  await app.register(compression, { encodings: ['gzip', 'deflate'] });

  return app;
}
