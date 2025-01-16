import { Injectable } from '@nestjs/common';
import { JobNode } from 'bullmq';
import { UpdateTransactionStatusDTO } from '../dtos/update-transaction-status.dto';
import { BullmqCreateJobService } from '../modules/bullmq/src/services/bullmq-create-job.service';
import { BullmqProducerService } from '../modules/bullmq/src/services/bullmq-producer.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly bullmqService: BullmqProducerService,
    private readonly jobService: BullmqCreateJobService,
  ) {}

  async start(id: string): Promise<JobNode> {
    const opts = { jobId: id };

    const create = this.jobService.createTransaction({ id }, opts);
    const process = this.jobService.processTransaction({ id }, opts);
    const update = this.jobService.updateTransactionStatus({ id }, opts);

    const job = await this.bullmqService.addFlow({
      ...update,
      children: [{ ...process, children: [create] }],
    });

    return job;
  }

  async updateStatus(_data: UpdateTransactionStatusDTO): Promise<void> {}
}
