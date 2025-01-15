import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { UnrecoverableError } from 'bullmq';
import { lastValueFrom } from 'rxjs';
import type { BullmqSandboxedJob } from '../../../../../../@types/bullmq.module';
import { Transaction } from '../../../../../../@types/utils.module';
import { TransactionStatus } from '../../../../../../enums/transaction-status.enum';
import { BullmqQueueService } from '../../../../services/bullmq-queue.service';
import { BULLMQ_JOB } from '../../../constants';
import { Handler } from '../../../handler';
import { Validator } from '../../../validator';
import { ProcessTransactionPayloadDTO } from '../dtos/payload.dto';
import type {
  UpdateTransactionStatusJobData,
  UpdateTransactionStatusJobReturnValue,
} from '../types';

@Injectable()
export class HandlerService extends Handler<
  UpdateTransactionStatusJobData,
  UpdateTransactionStatusJobReturnValue,
  ProcessTransactionPayloadDTO
> {
  private readonly THIRD_PARTY_API_URL = process.env['THIRD_PARTY_API_URL'];
  private readonly CLIENT_API_URL = process.env['CLIENT_API_URL'];

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
  ) {
    super(job, logger, validator, queueService, ProcessTransactionPayloadDTO);
  }

  override async handler(
    data: ProcessTransactionPayloadDTO,
  ): Promise<UpdateTransactionStatusJobReturnValue> {
    const getUrl = `${this.THIRD_PARTY_API_URL}/transaction/${data.id}`;
    const postUrl = `${this.CLIENT_API_URL}/transaction`;

    const fromDb = { ...data, status: TransactionStatus.PENDING };

    if (!fromDb) throw new UnrecoverableError('Transaction not found');

    if (fromDb.status !== TransactionStatus.PENDING) return fromDb;

    const getStatus = this.httpService.get<Transaction | undefined>(getUrl);
    const { data: status } = await lastValueFrom(getStatus);

    const update = this.httpService.put(postUrl, { status });

    await lastValueFrom(update);

    return status!;
  }
}
