import { Injectable } from '@nestjs/common';
import { merge } from 'lodash';
import { BullmqFlowJob } from '../../../@types/bullmq.module';
import { Event } from '../../../enums/event.enum';
import { CreateTransactionJobData } from '../lambdas/processors/create-transaction/types';
import { ProcessTransactionJobData } from '../lambdas/processors/process-transaction/types';
import { UpdateTransactionStatusJobData } from '../lambdas/processors/update-transaction-status/types';
import { BullmqProducerService } from './bullmq-producer.service';

@Injectable()
export class BullmqCreateJobService {
  constructor(private readonly bullmqProducerService: BullmqProducerService) {}

  createTransaction(
    data: CreateTransactionJobData,
    opts?: BullmqFlowJob<CreateTransactionJobData>['opts'],
  ): BullmqFlowJob {
    return this.bullmqProducerService.createFlowJob({
      name: this.bullmqProducerService.getJobName(Event.CREATE_TRANSACTION),
      queueName: Event.CREATE_TRANSACTION,
      data,
      opts: merge({ failParentOnFailure: true }, opts),
    });
  }

  processTransaction(
    data: ProcessTransactionJobData,
    opts?: BullmqFlowJob<ProcessTransactionJobData>['opts'],
  ): BullmqFlowJob {
    return this.bullmqProducerService.createFlowJob({
      name: this.bullmqProducerService.getJobName(Event.PROCESS_TRANSACTION),
      queueName: Event.PROCESS_TRANSACTION,
      data,
      opts: merge({ failParentOnFailure: true }, opts),
    });
  }

  updateTransactionStatus(
    data: UpdateTransactionStatusJobData,
    opts?: BullmqFlowJob<UpdateTransactionStatusJobData>['opts'],
  ): BullmqFlowJob {
    return this.bullmqProducerService.createFlowJob({
      name: this.bullmqProducerService.getJobName(
        Event.UPDATE_TRANSACTION_STATUS,
      ),
      queueName: Event.UPDATE_TRANSACTION_STATUS,
      data,
      opts: merge({ failParentOnFailure: true }, opts, {
        backoff: (attempts: number) => (attempts === 0 ? 200 : 5000 * attempts),
        attempts: Number.MAX_SAFE_INTEGER,
      }),
    });
  }
}
