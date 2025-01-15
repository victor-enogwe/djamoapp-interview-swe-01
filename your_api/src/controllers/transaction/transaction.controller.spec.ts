import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { TransactionStatus } from '../../modules/enums/transaction-status.enum';
import { TransactionService } from '../../services/transaction.service';
import { TransactionController } from './transaction.controller';

describe('Transaction Controller: ', () => {
  let transactionController: TransactionController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            startTransaction: jest.fn(async (id: string) =>
              Promise.resolve({
                job: { id },
              }),
            ),
          },
        },
      ],
    }).compile();

    transactionController = app.get<TransactionController>(
      TransactionController,
    );
  });

  describe('root', () => {
    it('should create a transaction"', async () => {
      const id = randomUUID();
      const transaction = await transactionController.createTransaction({ id });

      expect(transaction).toEqual(
        expect.objectContaining({ id, status: TransactionStatus.PENDING }),
      );
    });
  });
});
