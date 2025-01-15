import { Inject, Injectable, Logger } from '@nestjs/common';
import type { BullmqSandboxedJob } from '../../../../../../@types/bullmq.module';
import { TransactionStatus } from '../../../../../../enums/transaction-status.enum';
import { BullmqQueueService } from '../../../../services/bullmq-queue.service';
import { BULLMQ_JOB } from '../../../constants';
import { Handler } from '../../../handler';
import { Validator } from '../../../validator';
import { CreateTransactionPayloadDTO } from '../dtos/payload.dto';
import type {
  CreateTransactionJobData,
  CreateTransactionJobReturnValue,
} from '../types';

@Injectable()
export class HandlerService extends Handler<
  CreateTransactionJobData,
  CreateTransactionJobReturnValue,
  CreateTransactionPayloadDTO
> {
  constructor(
    @Inject(BULLMQ_JOB)
    job: BullmqSandboxedJob<
      CreateTransactionJobData,
      CreateTransactionJobReturnValue
    >,
    logger: Logger,
    validator: Validator,
    queueService: BullmqQueueService,
  ) {
    super(job, logger, validator, queueService, CreateTransactionPayloadDTO);
  }

  override async handler(
    data: CreateTransactionPayloadDTO,
  ): Promise<CreateTransactionJobReturnValue> {
    // get or create transaction
    return Promise.resolve({ ...data, status: TransactionStatus.PENDING });
  }
}
