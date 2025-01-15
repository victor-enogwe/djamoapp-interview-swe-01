import { Injectable } from '@nestjs/common';
import { merge } from 'lodash';
import { BullmqFlowJob } from '../../../@types/bullmq.module';
import { Event } from '../../../enums/event.enum';
import { CreateTransactionJobData } from '../lambdas/processors/create-transaction/types';
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

  processTransaction(): BullmqFlowJob {
    return this.bullmqProducerService.createFlowJob({
      name: this.bullmqProducerService.getJobName(Event.PROCESS_TRANSACTION),
      queueName: Event.PROCESS_TRANSACTION,
      data: {},
      opts: { jobId: '', failParentOnFailure: true },
    });
  }

  updateTransactionStatus(): BullmqFlowJob {
    return this.bullmqProducerService.createFlowJob({
      name: this.bullmqProducerService.getJobName(
        Event.UPDATE_TRANSACTION_STATUS,
      ),
      queueName: Event.UPDATE_TRANSACTION_STATUS,
      data: {},
      opts: { jobId: '', failParentOnFailure: true },
    });
  }

  transactionStatusNotification(): BullmqFlowJob {
    return this.bullmqProducerService.createFlowJob({
      name: this.bullmqProducerService.getJobName(
        Event.TRANSACTION_STATUS_NOTIFICATION,
      ),
      queueName: Event.TRANSACTION_STATUS_NOTIFICATION,
      data: {},
      opts: { jobId: '', failParentOnFailure: true },
    });
  }
}
