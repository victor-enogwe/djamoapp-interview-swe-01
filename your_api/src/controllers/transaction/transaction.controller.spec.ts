import type { FastifyAdapter } from '@nestjs/platform-fastify';
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
                job: {
                  id,
                  getChildrenValues: jest.fn(async () => Promise.resolve({})),
                },
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

      const res = {
        status: jest.fn(() => res),
        send: jest.fn(() => res),
      } as unknown as ReturnType<FastifyAdapter['reply']>;

      const transaction = await transactionController.createTransaction(
        { id },
        res,
      );

      expect(transaction).toEqual(
        expect.objectContaining({ id, status: TransactionStatus.PENDING }),
      );
    });
  });
});
