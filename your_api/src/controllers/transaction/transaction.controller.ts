import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { get } from 'lodash';
import { Transaction } from '../../modules/@types/utils.module';
import { CreateTransactionPayloadDTO } from '../../modules/bullmq/src/lambdas/processors/create-transaction/dtos/payload.dto';
import { CreateTransactionJobReturnValue } from '../../modules/bullmq/src/lambdas/processors/create-transaction/types';
import { BULL_MQ_PREFIX } from '../../modules/bullmq/src/providers/options.factory';
import { Event } from '../../modules/enums/event.enum';
import { TransactionStatus } from '../../modules/enums/transaction-status.enum';
import { TransactionService } from '../../services/transaction.service';

@Controller({ path: '/transaction' })
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(
    @Body() { id }: CreateTransactionPayloadDTO,
    @Res() res: ReturnType<FastifyAdapter['reply']>,
  ): Promise<CreateTransactionJobReturnValue> {
    const { job } = await this.transactionService.start(id);

    const returnValues = await job.getChildrenValues();
    const jobKey = `${BULL_MQ_PREFIX}:${Event.PROCESS_TRANSACTION}:${id}`;
    const status = TransactionStatus.PENDING;
    const txn = get(returnValues, jobKey, { status, id }) as Transaction;
    const completed = txn.status === TransactionStatus.COMPLETED;
    const statusCode = completed ? HttpStatus.OK : HttpStatus.CREATED;

    res.status(statusCode).send(txn);

    return txn;
  }
}
