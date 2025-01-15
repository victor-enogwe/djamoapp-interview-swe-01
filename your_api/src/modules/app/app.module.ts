import { Module } from '@nestjs/common';
import { TransactionController } from '../../controllers/transaction/transaction.controller';
import { TransactionService } from '../../services/transaction.service';

@Module({
  imports: [],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class AppModule {}
