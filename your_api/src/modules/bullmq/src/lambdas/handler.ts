import type { Logger } from '@nestjs/common';
import { UnrecoverableError } from 'bullmq';
import type { BullmqQueueService } from '../../../bullmq/src/services/bullmq-queue.service';

import type {
  BullmqJob,
  BullmqSandboxedJob,
  LambdaService,
} from '../../../@types/bullmq.module';
import type { Class } from '../../../@types/utils.module';
import type { Validator } from './validator';

export abstract class Handler<T extends object, R, DTO extends object>
  implements LambdaService<R, T>
{
  constructor(
    protected readonly job: BullmqSandboxedJob<T, R>,
    protected readonly logger: Logger,
    protected readonly validator: Validator,
    protected readonly queueService: BullmqQueueService,
    protected readonly dto: Class<DTO>,
  ) {}

  abstract handler(jobData: DTO, job: BullmqJob<T, R>): Promise<R>;

  async run(): Promise<R> {
    try {
      const job = await this.queueService.getJobFromSandboxJob<T, R>(this.job);
      const data = await this.validator.data(job!.data, this.dto);

      const isCompleted = await job?.isCompleted();
      const isFailed = await job?.isFailed();

      if (isCompleted) return job!.returnvalue;

      if (isFailed) throw new UnrecoverableError(job?.failedReason);

      await this.job.updateProgress({ progress: 50 });

      const result = await this.handler(data, job!);

      await this.job.updateProgress({ progress: 100 });

      return result;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
