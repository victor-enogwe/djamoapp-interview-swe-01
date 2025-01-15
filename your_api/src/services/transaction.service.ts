import { Injectable } from '@nestjs/common';
import { JobNode } from 'bullmq';
import { BullmqCreateJobService } from '../modules/bullmq/src/services/bullmq-create-job.service';
import { BullmqProducerService } from '../modules/bullmq/src/services/bullmq-producer.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly bullmqService: BullmqProducerService,
    private readonly jobService: BullmqCreateJobService,
  ) {}

  async startTransaction(id: string): Promise<JobNode> {
    const job = await this.bullmqService.addFlow({
      ...this.jobService.processTransaction({ id }),
      opts: { jobId: id },
      children: [
        {
          ...this.jobService.createTransaction({ id }, { jobId: id }),
          opts: { jobId: id },
        },
      ],
    });

    return job;
  }
}
