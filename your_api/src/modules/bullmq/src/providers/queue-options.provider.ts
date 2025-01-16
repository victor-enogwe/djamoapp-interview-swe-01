import type {
  BullQueueAdvancedSeparateProcessor,
  RegisterQueueOptions,
  RegisterQueueOptionsFactory,
} from '@nestjs/bullmq';
import { Inject, Injectable, ShutdownSignal } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import type { RateLimiterOptions } from 'bullmq';
import { Redis } from 'ioredis';
import { get } from 'lodash';
import { stat } from 'node:fs/promises';
import { cpus } from 'node:os';
import { join, resolve } from 'node:path';
import type { BullmqQueuesModuleOptions } from '../../../@types/bullmq.module';
import { BullmqDefaultJobOptionsOptionsProvider } from './default-job-options.provider';
import {
  BULL_MQ_PREFIX,
  BULL_QUEUES_MODULE_OPTIONS,
  BULL_TOPIC,
} from './options.factory';
import { BullmqWorkerEnvProvider } from './worker-env.provider';

@Injectable()
export class BullmqQueueOptionsProvider implements RegisterQueueOptionsFactory {
  readonly workerFolder = `${this.topic.replace(/_/g, '-').toLowerCase()}`;

  private readonly prodMode =
    this.configService.getOrThrow<string>('NODE_ENV') === 'production';

  private readonly testMode =
    this.configService.getOrThrow<string>('NODE_ENV') === 'test';

  constructor(
    @Inject(BULL_QUEUES_MODULE_OPTIONS)
    private readonly options: BullmqQueuesModuleOptions,
    @Inject(BULL_TOPIC) private readonly topic: string,
    private readonly redis: Redis,
    private readonly defaultJobOptions: BullmqDefaultJobOptionsOptionsProvider,
    private readonly moduleRef: ModuleRef,
    private readonly envProvider: BullmqWorkerEnvProvider,
    private readonly configService: ConfigService,
  ) {}

  private async workerPath(): Promise<string | undefined> {
    const processorDir = resolve(__dirname, '../', 'lambdas/processors');
    const handler = join(processorDir, this.workerFolder, 'index');
    const jsPath = `${handler}.js`;
    const tsPath = `${handler}.ts`;
    const jsFileStat = await stat(jsPath).catch(() => undefined);
    const tsFileStat = await stat(tsPath).catch(() => undefined);

    const path = jsFileStat?.isFile()
      ? jsPath
      : tsFileStat?.isFile()
        ? tsPath
        : undefined;

    return path;
  }

  private async getProcessors(): Promise<BullQueueAdvancedSeparateProcessor[]> {
    const availableCPus = cpus();
    const processors: BullQueueAdvancedSeparateProcessor[] = [];
    const { registerWorkers } = this.options;
    const path = registerWorkers ? await this.workerPath() : undefined;
    const noOfProcessors = this.testMode ? 1 : availableCPus.length;

    if (!path) return processors;

    for (let index = 0; index < noOfProcessors; index++) {
      const name = `worker/${this.topic}/${index}`;

      const env = await this.moduleRef
        .resolve<NodeJS.ProcessEnv>(`${this.topic}_WORKER_ENV`)
        .catch(() => this.envProvider);

      const rateLimiterMax = get(env, 'rateLimiterMax');
      const rateLimiterDuration = get(env, 'rateLimiterDuration');

      processors.push({
        name,
        path,
        useWorkerThreads: false,
        concurrency: +(env.concurrency ?? 50),
        connection: this.redis.duplicate({
          db: 7,
          maxRetriesPerRequest: null,
          name: `bullmq-worker-${name}-${index}`,
          enableAutoPipelining: false,
          connectionName: `djamo-bullmq-worker-${name}-${index}-client`,
        }),
        blockingConnection: false,
        autorun: true,
        prefix: BULL_MQ_PREFIX,
        limiter: {
          groupKey: get(env, 'rateLimiterGroupKey', 'rateLimiterGroupKey'),
          max: rateLimiterMax ? parseInt(rateLimiterMax, 10) : undefined,
          duration: rateLimiterDuration
            ? parseInt(rateLimiterDuration, 10)
            : undefined,
        } as RateLimiterOptions,
        workerForkOptions: {
          detached: this.prodMode,
          env,
          killSignal: ShutdownSignal.SIGTERM,
          serialization: 'json',
          timeout: 300000,
        },
      });
    }

    return processors;
  }

  async createRegisterQueueOptions(): Promise<RegisterQueueOptions> {
    const processors = await this.getProcessors();

    return {
      name: this.topic,
      blockingConnection: false,
      connection: this.redis.duplicate({
        db: 7,
        maxRetriesPerRequest: null,
        name: `bullmq-topic-${this.topic}`,
        connectionName: `djamo-bullmq-topic-${this.topic}-client`,
      }),
      prefix: BULL_MQ_PREFIX,
      processors,
      defaultJobOptions: this.defaultJobOptions,
    };
  }
}
