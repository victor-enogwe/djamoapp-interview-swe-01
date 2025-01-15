import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { TransactionService } from '../../services/transaction.service';
import { TransactionController } from './transaction.controller';

describe('Transaction Controller: ', () => {
  let transactionController: TransactionController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [TransactionService],
    }).compile();

    transactionController = app.get<TransactionController>(
      TransactionController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(transactionController.getHello()).toBe('Hello World!');
    });
  });
});
