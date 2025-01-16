import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import type { App } from 'supertest/types';
import { AppModule } from '../src/modules/app/app.module';
import { TransactionStatus } from '../src/modules/enums/transaction-status.enum';
import { TransactionDriver } from './drivers/transaction.driver';
import { WebhookDriver } from './drivers/webhook.driver';

describe('Webhook Controller (e2e)', () => {
  let app: INestApplication<App>;
  let webhookDriver: WebhookDriver;
  let transactionDriver: TransactionDriver;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    webhookDriver = new WebhookDriver(app);
    transactionDriver = new TransactionDriver(app);

    await app.init();
  });

  it('/webhook(POST): should update the txn status', async () => {
    const id = randomUUID();
    const update = { id, status: TransactionStatus.COMPLETED };

    const txn = await transactionDriver.createTransaction({ id });

    expect(txn.body).toEqual(
      expect.objectContaining({ id, status: TransactionStatus.PENDING }),
    );

    await webhookDriver.send(update);

    const fromDb = await Promise.resolve({ id: '123' });

    expect(fromDb).toEqual(expect.objectContaining(update));
  });
});
