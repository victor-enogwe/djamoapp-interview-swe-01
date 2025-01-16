import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { UnrecoverableError } from 'bullmq';
import { lastValueFrom } from 'rxjs';
import { DataSource } from 'typeorm';
import type { BullmqSandboxedJob } from '../../../../../../@types/bullmq.module';
import { Transaction } from '../../../../../../@types/utils.module';
import { TransactionEntity } from '../../../../../../database/entities/transaction.entity';
import { TransactionStatus } from '../../../../../../enums/transaction-status.enum';
import { BullmqQueueService } from '../../../../services/bullmq-queue.service';
import { BULLMQ_JOB } from '../../../constants';
import { Handler } from '../../../handler';
import { Validator } from '../../../validator';
import { UpdateTransactionPayloadDTO } from '../dtos/payload.dto';
import type {
  UpdateTransactionStatusJobData,
  UpdateTransactionStatusJobReturnValue,
} from '../types';

@Injectable()
export class HandlerService extends Handler<
  UpdateTransactionStatusJobData,
  UpdateTransactionStatusJobReturnValue,
  UpdateTransactionPayloadDTO
> {
  private readonly THIRD_PARTY_API_URL = process.env['THIRD_PARTY_API_URL'];
  private readonly CLIENT_API_URL = process.env['CLIENT_API_URL'];

  private readonly transactionRepository =
    this.datasource.getRepository(TransactionEntity);

  constructor(
    @Inject(BULLMQ_JOB)
    job: BullmqSandboxedJob<
      UpdateTransactionStatusJobData,
      UpdateTransactionStatusJobReturnValue
    >,
    logger: Logger,
    validator: Validator,
    queueService: BullmqQueueService,
    private readonly httpService: HttpService,
    private readonly datasource: DataSource,
  ) {
    super(job, logger, validator, queueService, UpdateTransactionPayloadDTO);
  }

  override async handler(
    data: UpdateTransactionPayloadDTO,
  ): Promise<UpdateTransactionStatusJobReturnValue> {
    const id = data.id as unknown as number;
    const getUrl = `${this.THIRD_PARTY_API_URL}/transaction/${id}`;
    const postUrl = `${this.CLIENT_API_URL}/transaction`;

    const transaction = await this.transactionRepository.findOneBy({ id });

    if (!transaction) throw new UnrecoverableError('Transaction not found');

    const txn = {
      id: transaction.id as unknown as string,
      status: transaction.status,
    };

    const finished = transaction.status !== TransactionStatus.PENDING;

    if (finished) return txn;

    const hasStatus = TransactionStatus.values.includes(data.status!);

    const status = hasStatus
      ? txn
      : await lastValueFrom(
          this.httpService.get<Transaction | undefined>(getUrl),
        ).then((response) => response.data);

    const result = await this.transactionRepository.update(
      { id },
      { status: status!.status, updatedAt: new Date() },
    );

    this.logger.log(`Transaction ${JSON.stringify(result)}`);

    const update = this.httpService.put(postUrl, {
      status: result.generatedMaps[0]['status'] as TransactionStatus,
    });

    await lastValueFrom(update);

    return status as UpdateTransactionStatusJobReturnValue;
  }
}
