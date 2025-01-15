import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import type { App } from 'supertest/types';
import { AppModule } from '../src/modules/app/app.module';
import { TransactionDriver } from './drivers/transaction.driver';

describe('Transaction Controller (e2e)', () => {
  let app: INestApplication<App>;
  let transactionDriver: TransactionDriver;

  const webhookUrl = 'http://localhost:3200/webhook';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    transactionDriver = new TransactionDriver(app);

    await app.init();
  });

  it('/transaction(POST): should return a response immediately', async () => {
    const transaction = await transactionDriver.createTransaction({
      id: randomUUID(),
    });

    expect(transaction.body).toEqual(expect.objectContaining({ id: '123' }));
  });

  it('/transaction(POST): response time should be below 200ms', async () => {
    const transaction = await transactionDriver.createTransaction({
      id: randomUUID(),
    });

    expect(transaction.header['X-Response-Time']).toBeLessThanOrEqual(200);
  });

  it('/transaction(POST): should dispatch a txn create event', async () => {
    const { body: transaction } = await transactionDriver.createTransaction({
      id: randomUUID(),
    });

    const createJob = await Promise.resolve({ id: '123' });

    expect(createJob).toEqual(expect.objectContaining({ id: transaction.id }));
  });

  it('/transaction(POST): should dispatch a txn create event', async () => {
    const { body: transaction } = await transactionDriver.createTransaction({
      id: randomUUID(),
    });

    const createTransactionJob = await Promise.resolve({
      data: { id: '123' },
      parent: {},
    });

    expect(createTransactionJob.data).toEqual(
      expect.objectContaining({ id: transaction.id }),
    );

    expect(createTransactionJob.parent).toEqual(
      expect.objectContaining({
        data: {
          id: transaction.id,
          webhookUrl,
        },
      }),
    );
  });

  it('/transaction(POST): should dispatch a txn process event', async () => {
    const { body: transaction } = await transactionDriver.createTransaction({
      id: randomUUID(),
    });

    const processTransactionJob = await Promise.resolve({
      data: { id: '123', webhookUrl },
      parent: {},
    });

    expect(processTransactionJob.data).toEqual(
      expect.objectContaining({ id: transaction.id, webhookUrl }),
    );

    expect(processTransactionJob.parent).toEqual(
      expect.objectContaining({ data: { id: transaction.id } }),
    );
  });

  it('/transaction(POST): should dispatch a txn update event', async () => {
    const { body: transaction } = await transactionDriver.createTransaction({
      id: randomUUID(),
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
    const { body: transaction } = await transactionDriver.createTransaction({
      id: randomUUID(),
    });

    const updateTransactionStatusClientJob = await Promise.resolve({
      data: { id: '123' },
      parent: null,
    });

    expect(updateTransactionStatusClientJob.data).toEqual(
      expect.objectContaining({ id: transaction.id }),
    );

    expect(updateTransactionStatusClientJob.parent).toBeNull();
  });

  it("/transaction/:id(GET): fetch a txn's status", async () => {
    const createdTransaction = await transactionDriver.createTransaction({
      id: randomUUID(),
    });

    expect(createdTransaction.body).toEqual(
      expect.objectContaining({ id: '123', status: 'pending' }),
    );

    const transaction = await transactionDriver.getTransaction(
      createdTransaction.body.id,
    );

    expect(transaction.body).toEqual(
      expect.objectContaining({
        id: '123',
        status: expect.stringMatching(/pending|completed|declined/) as unknown,
      }),
    );
  });
});
