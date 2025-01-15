import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import type { App } from 'supertest/types';
import { AppModule } from '../src/modules/app/app.module';
import { WebhookDriver } from './drivers/webhook.driver';

describe('Webhook Controller (e2e)', () => {
  let app: INestApplication<App>;
  let webhookDriver: WebhookDriver;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    webhookDriver = new WebhookDriver(app);

    await app.init();
  });

  it('/transaction(POST): should dispatch a txn update event', async () => {
    const { body: transaction } = await webhookDriver.send({
      id: randomUUID(),
      status: 'completed',
    });

    const updateTransactionStatusJob = await Promise.resolve({
      data: { id: '123' },
      parent: {},
    });

    expect(updateTransactionStatusJob.data).toEqual(
      expect.objectContaining({ id: transaction.id }),
    );

    expect(updateTransactionStatusJob.parent).toEqual(
      expect.objectContaining({ data: { id: transaction.id } }),
    );
  });

  it('/transaction(POST): should dispatch a client update event', async () => {
    const { body: transaction } = await webhookDriver.send({
      id: randomUUID(),
      status: 'declined',
    });

    const updateTransactionStatusClientJob = await Promise.resolve({
      data: { id: '123' },
      parent: null,
    });

    expect(updateTransactionStatusClientJob.data).toEqual(
      expect.objectContaining({ id: transaction.id }),
    );
  });
});
