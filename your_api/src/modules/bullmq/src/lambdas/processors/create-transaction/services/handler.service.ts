import { Inject, Injectable, Logger } from '@nestjs/common';
import { get } from 'lodash';
import { DataSource } from 'typeorm';
import type { BullmqSandboxedJob } from '../../../../../../@types/bullmq.module';
import { TransactionEntity } from '../../../../../../database/entities/transaction.entity';
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
  private readonly transactionRepository =
    this.datasource.getRepository(TransactionEntity);

  constructor(
    @Inject(BULLMQ_JOB)
    job: BullmqSandboxedJob<
      CreateTransactionJobData,
      CreateTransactionJobReturnValue
    >,
    logger: Logger,
    validator: Validator,
    queueService: BullmqQueueService,
    private readonly datasource: DataSource,
  ) {
    super(job, logger, validator, queueService, CreateTransactionPayloadDTO);
  }

  override async handler(
    data: CreateTransactionPayloadDTO,
  ): Promise<CreateTransactionJobReturnValue> {
    const id = data.id as unknown as number;

    const transaction = await this.transactionRepository.findOneBy({ id });

    if (transaction) {
      this.logger.warn(`Transaction with id: ${id} already exists`);

      return {
        id: transaction.id as unknown as string,
        status: transaction.status,
      };
    }

    const newTransaction = await this.transactionRepository.insert({ id });

    return Promise.resolve({
      id: get(newTransaction, 'identifiers.0.id') as unknown as string,
      status: get(
        newTransaction,
        'generatedMaps.0.status',
      ) as TransactionStatus,
    });
  }
}
