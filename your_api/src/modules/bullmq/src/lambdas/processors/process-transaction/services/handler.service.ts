import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import type { BullmqSandboxedJob } from '../../../../../../@types/bullmq.module';
import { Transaction } from '../../../../../../@types/utils.module';
import { BullmqQueueService } from '../../../../services/bullmq-queue.service';
import { BULLMQ_JOB } from '../../../constants';
import { Handler } from '../../../handler';
import { Validator } from '../../../validator';
import { ProcessTransactionPayloadDTO } from '../dtos/payload.dto';
import type {
  ProcessTransactionJobData,
  ProcessTransactionJobReturnValue,
} from '../types';

@Injectable()
export class HandlerService extends Handler<
  ProcessTransactionJobData,
  ProcessTransactionJobReturnValue,
  ProcessTransactionPayloadDTO
> {
  private readonly API_URL = process.env['API_URL'];
  private readonly THIRD_PARTY_API_URL = process.env['THIRD_PARTY_API_URL'];

  constructor(
    @Inject(BULLMQ_JOB)
    job: BullmqSandboxedJob<
      ProcessTransactionJobData,
      ProcessTransactionJobReturnValue
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
  ): Promise<ProcessTransactionJobReturnValue> {
    const postUrl = `${this.THIRD_PARTY_API_URL}/transaction`;
    const getUrl = `${postUrl}/${data.id}`;
    const webhookUrl = `${this.API_URL}/webhook`;

    const { data: transaction, status } = await lastValueFrom(
      this.httpService.get<Transaction | undefined>(getUrl, {
        validateStatus: (status) => status < 500,
      }),
    );

    if (transaction && status === 200) return transaction;

    const { data: newTransaction } = await lastValueFrom(
      this.httpService.post<Transaction>(postUrl, { ...data, webhookUrl }),
    );

    return newTransaction;
  }
}
