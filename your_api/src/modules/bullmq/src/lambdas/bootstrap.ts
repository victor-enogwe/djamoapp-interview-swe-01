import { Logger, Module, type ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  BullmqSandboxedJob,
  LambdaService,
} from '../../../@types/bullmq.module';
import { UtilsModule } from '../../../utils/utils.module';
import { BullmqQueuesModule } from '../bullmq-queues.module';
import { BULLMQ_JOB, HANDLER_SERVICE } from './constants';
import { createJobLogger } from './create-job-logger';
import { Validator } from './validator';
import { RedisModule } from '../../../redis/src';

export default function bootstrap<R, D>(
  moduleCls: Omit<ModuleMetadata, 'controllers' | 'exports'>,
): (job: BullmqSandboxedJob<D, R>) => Promise<R> {
  return async function handler(job: BullmqSandboxedJob<D, R>): Promise<R> {
    const logger = createJobLogger(job);

    @Module({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        UtilsModule,
        RedisModule,
        BullmqQueuesModule.forRoot({ registerWorkers: false }),
        ...(moduleCls.imports ?? []),
      ],
      providers: [
        { provide: Logger, useValue: logger },
        { provide: BULLMQ_JOB, useValue: job },
        Validator,
        ...(moduleCls.providers ?? []),
      ],
    })
    class HandlerModule {}

    const attempts = job.attemptsMade + 1;

    logger.log(`Running Lambda(${job.queueName}):${job.id}:#${attempts}`);

    const app = await NestFactory.createApplicationContext(HandlerModule, {
      bufferLogs: true,
      logger,
      abortOnError: true,
    });

    app.useLogger(logger);

    const lambdaService = app.get<LambdaService<R, D>>(HANDLER_SERVICE);

    const result = await lambdaService.run();

    return result;
  };
}
