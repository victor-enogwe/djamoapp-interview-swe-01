import type { FlowChildJob, Job, SandboxedJob } from 'bullmq';
import type { Class } from 'ts-mixer/dist/types/types';

export interface BullmqQueuesModuleOptions {
  registerWorkers: boolean;
}

export interface JobOptions {
  jobId: string;
}

export interface JobDataFromChildReturnValues {
  childrenReturnValues?: ChildReturnValueKeys;
}

export interface FlowOptions {
  rollbackChildrenOnFailure?: boolean;
}

export interface BullmqFlowJob<T = unknown>
  extends Omit<FlowChildJob, 'data' | 'opts'> {
  data: Merge<T, JobDataFromChildReturnValues>;
  opts: FlowChildJob['opts'] & FlowOptions & JobOptions;
}

export interface BullmqSandboxedJob<T = unknown, R = unknown>
  extends SandboxedJob<T, R> {
  opts: SandboxedJob<T, R>['opts'] & FlowOptions & JobOptions;
}

export interface BullmqJob<T = unknown, R = unknown> extends Job<T, R> {
  opts: Job<T, R>['opts'] & FlowOptions & JobOptions;
}

export interface LambdaService<T, D = unknown>
  extends Omit<
    Class<LambdaService<T, D>, [BullmqSandboxedJob<D, T>, unknown[]]>,
    'prototype'
  > {
  run(): Promise<T>;
}
