import { Controller, Get } from '@nestjs/common';
import { TransactionService } from '../../services/transaction.service';

@Controller()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  getHello(): string {
    return this.transactionService.getHello();
  }
}
