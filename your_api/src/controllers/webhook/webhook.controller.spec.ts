import type { FastifyAdapter } from '@nestjs/platform-fastify';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { TransactionStatus } from '../../modules/enums/transaction-status.enum';
import { TransactionService } from '../../services/transaction.service';
import { WebhookController } from './webhook.controller';

describe('Transaction Controller: ', () => {
  let transactionController: WebhookController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            updateStatus: jest.fn(async () => Promise.resolve()),
          },
        },
      ],
    }).compile();

    transactionController = app.get<WebhookController>(WebhookController);
  });

  describe('root', () => {
    it('should create a transaction"', async () => {
      const id = randomUUID();

      const res = {
        status: jest.fn(() => res),
        send: jest.fn(() => res),
      } as unknown as ReturnType<FastifyAdapter['reply']>;

      const transaction = await transactionController.updateTransactionStatus({
        id,
        status: TransactionStatus.COMPLETED,
      });

      expect(transaction).toBeUndefined();
    });
  });
});
