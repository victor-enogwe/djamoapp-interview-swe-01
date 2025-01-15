import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Job, type Queue } from 'bullmq';
import { BullmqJob, BullmqSandboxedJob } from '../../../@types/bullmq.module';
import { Event } from '../../../enums/event.enum';
import { BULL_QUEUES } from '../providers/options.factory';

@Injectable()
export class BullmqQueueService implements OnApplicationShutdown {
  constructor(
    @Inject(BULL_QUEUES) private readonly queues: Map<Event, Queue>,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await Promise.all(
      [...this.queues.entries()].map(([_name, queue]) => queue.close()),
    );
  }

  getQueue(name: Event): Queue | undefined {
    return this.queues.get(name);
  }

  async getJobFromSandboxJob<T, R>(
    sandboxJob: Pick<BullmqSandboxedJob<T, R>, 'queueName' | 'id' | 'log'>,
  ): Promise<BullmqJob<T, R> | undefined> {
    try {
      const queue = this.queues.get(sandboxJob.queueName as unknown as Event)!;
      const job = (await queue.getJob(sandboxJob.id)) as BullmqJob<T, R>;

      return job;
    } catch (error) {
      sandboxJob.log(`failed to fetch job: ${(error as Error).message}`);

      return undefined;
    }
  }

  async getParentJobFromSandboxJob<T, R>(
    sandboxJob: BullmqSandboxedJob<T, R>,
  ): Promise<Job<T, R> | undefined> {
    try {
      const parentQueueName = sandboxJob.parentKey!.split(':')[1];
      const parentQueue = this.queues.get(parentQueueName as unknown as Event)!;

      const job = await Job.fromId<T, R>(parentQueue, sandboxJob.parent!.id);

      return job;
    } catch (error) {
      sandboxJob.log(`failed to fetch parent job: ${(error as Error).message}`);

      return undefined;
    }
  }
}
