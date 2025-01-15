import type { LoggerService } from '@nestjs/common';
import type { BullmqSandboxedJob } from '../../../@types/bullmq.module';

export function createJobLogger<D, R>(
  job: BullmqSandboxedJob<D, R>,
): LoggerService {
  const ctx = job.id;

  return {
    setLogLevels: (_levels) => undefined,
    log: (...data) => job.log(JSON.stringify({ info: true, data, ctx })),
    debug: (...data) => job.log(JSON.stringify({ debug: true, data, ctx })),
    error: (...data) => job.log(JSON.stringify({ error: true, data, ctx })),
    warn: (...data) => job.log(JSON.stringify({ warn: true, data, ctx })),
    fatal: (...data) => job.log(JSON.stringify({ fatal: true, data, ctx })),
    verbose: (...data) => job.log(JSON.stringify({ verbose: true, data, ctx })),
  };
}
