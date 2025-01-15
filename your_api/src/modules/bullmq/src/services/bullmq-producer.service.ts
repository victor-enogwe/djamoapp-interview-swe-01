import { InjectFlowProducer } from '@nestjs/bullmq';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import {
  FlowProducer,
  Job,
  type FlowJob,
  type FlowOpts,
  type JobNode,
  type MinimalQueue,
  type NodeOpts,
} from 'bullmq';
import { merge } from 'lodash';
import { randomUUID } from 'node:crypto';
import { BullmqFlowJob, BullmqJob } from '../../../@types/bullmq.module';
import { Event } from '../../../enums/event.enum';
import { BullmqDefaultJobOptionsOptionsProvider } from '../providers/default-job-options.provider';
import { BULL_FLOW_PRODUCER } from '../providers/options.factory';

@Injectable()
export class BullmqProducerService implements OnApplicationShutdown {
  constructor(
    @InjectFlowProducer(BULL_FLOW_PRODUCER)
    private readonly flowProducer: FlowProducer,
    readonly defaultJobOptions: BullmqDefaultJobOptionsOptionsProvider,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await this.flowProducer.close();
  }

  createFlowJob<T>(options: BullmqFlowJob<T>): BullmqFlowJob<T> {
    const { opts } = options;
    const { jobId = randomUUID() } = opts;
    const deduplicationId = opts.deduplication?.id ?? jobId;

    return merge({ opts: { ...this.defaultJobOptions } }, options, {
      opts: { jobId, deduplication: { id: deduplicationId } },
    });
  }

  async addFlow(flow: FlowJob, opts?: FlowOpts): Promise<JobNode> {
    return this.flowProducer.add(flow, opts);
  }

  getJobName(topic: Event): string {
    return `${topic}-job`;
  }

  async getJobFromId<T = unknown, R = unknown>(
    jobId: string,
    queue: MinimalQueue,
  ): Promise<BullmqJob<T, R> | undefined> {
    const job = await Job.fromId(queue, jobId);

    return job as BullmqJob<T, R>;
  }

  async getFlowTreeFromJobId(
    jobId: string,
    options: Omit<NodeOpts, 'id'>,
  ): Promise<JobNode | undefined> {
    const job = await this.flowProducer.getFlow({ ...options, id: jobId });

    return job;
  }
}
