import compression from '@fastify/compress';
import type { INestMicroservice } from '@nestjs/common';
import { ShutdownSignal } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions } from '@nestjs/microservices';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { ConsumerModule } from './modules/consumer/consumer.module';
import { logger } from './modules/logger/providers/logger';
import { ProducerModule } from './modules/producer/producer.module';
import { NoopStrategy } from './modules/redis/src/classes/noop.strategy';

const shutdownHooks: ShutdownSignal[] = [
  ShutdownSignal.SIGTERM,
  ShutdownSignal.SIGINT,
  ShutdownSignal.SIGHUP,
  ShutdownSignal.SIGQUIT,
  ShutdownSignal.SIGQUIT,
  ShutdownSignal.SIGABRT,
];

export async function bootstrapProducer(): Promise<NestFastifyApplication> {
  const testMode = process.env['NODE_ENV'] === 'test';

  const fastifyApp = new FastifyAdapter({
    onProtoPoisoning: 'error',
    onConstructorPoisoning: 'error',
    requestIdHeader: false,
    ignoreTrailingSlash: true,
    ignoreDuplicateSlashes: true,
    disableRequestLogging: testMode,
    genReqId: (): string => randomUUID(),
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
    ProducerModule,
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

export async function bootstrapConsumer(): Promise<INestMicroservice> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ConsumerModule,
    {
      strategy: new NoopStrategy(),
      bufferLogs: true,
      abortOnError: false,
      logger,
    },
  );

  app.enableShutdownHooks(shutdownHooks);

  return app;
}
