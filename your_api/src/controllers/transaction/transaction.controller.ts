import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTransactionPayloadDTO } from '../../modules/bullmq/src/lambdas/processors/create-transaction/dtos/payload.dto';
import { CreateTransactionJobReturnValue } from '../../modules/bullmq/src/lambdas/processors/create-transaction/types';
import { TransactionStatus } from '../../modules/enums/transaction-status.enum';
import { TransactionService } from '../../services/transaction.service';

@Controller({ path: '/transaction' })
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(
    @Body() { id }: CreateTransactionPayloadDTO,
  ): Promise<CreateTransactionJobReturnValue> {
    const { job } = await this.transactionService.startTransaction(id);

    return {
      id: job.id!,
      status: TransactionStatus.PENDING,
    };
  }

  @Get('/:id')
  async getTransaction(
    @Param('id') id: string,
  ): Promise<CreateTransactionJobReturnValue> {
    return Promise.resolve({
      id,
      status: TransactionStatus.PENDING,
    });
  }
}
