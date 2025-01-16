import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UpdateTransactionStatusDTO } from '../../dtos/update-transaction-status.dto';
import { TransactionService } from '../../services/transaction.service';

@Controller({ path: '/webhook' })
export class WebhookController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(204)
  async updateTransactionStatus(
    @Body() update: UpdateTransactionStatusDTO,
  ): Promise<void> {
    await this.transactionService.updateStatus(update);
  }
}
