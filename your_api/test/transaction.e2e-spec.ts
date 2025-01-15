import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import type { App } from 'supertest/types';
import { AppModule } from '../src/modules/app/app.module';
import { BullmqQueueService } from '../src/modules/bullmq/src/services/bullmq-queue.service';
import { Event } from '../src/modules/enums/event.enum';
import { TransactionStatus } from '../src/modules/enums/transaction-status.enum';
import { TransactionDriver } from './drivers/transaction.driver';

describe('Transaction Controller (e2e)', () => {
  let app: INestApplication<App>;
  let transactionDriver: TransactionDriver;
  let queueService: BullmqQueueService;

  const webhookUrl = 'http://localhost:3200/webhook';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    transactionDriver = new TransactionDriver(app);
    queueService = app.get<BullmqQueueService>(BullmqQueueService);

    await app.init();
  });

  it('/transaction(POST): should return a response immediately', async () => {
    const id = randomUUID();

    const transaction = await transactionDriver.createTransaction({
      id,
    });

    expect(transaction.body).toEqual(
      expect.objectContaining({ id, status: TransactionStatus.PENDING }),
    );
  });

  it('/transaction(POST): response time should be below 200ms', async () => {
    const id = randomUUID();

    const transaction = await transactionDriver.createTransaction({
      id,
    });

    expect(transaction.body).toEqual(
      expect.objectContaining({ id, status: TransactionStatus.PENDING }),
    );

    expect(transaction.header['X-Response-Time']).toBeLessThanOrEqual(200);
  });

  it('/transaction(POST): should dispatch a txn create event', async () => {
    const id = randomUUID();

    const { body: transaction } = await transactionDriver.createTransaction({
      id,
    });

    const queue = queueService.getQueue(Event.CREATE_TRANSACTION);

    const createTransactionJob = await queueService.getJobFromSandboxJob({
      queueName: queue?.name ?? Event.CREATE_TRANSACTION,
      id,
      log: () => undefined,
    });

    expect(createTransactionJob?.data).toEqual(
      expect.objectContaining({ id: transaction.id }),
    );

    expect(createTransactionJob?.parent).toEqual(
      expect.objectContaining({
        data: {
          id: transaction.id,
          webhookUrl,
        },
      }),
    );
  });

  it('/transaction(POST): should dispatch a txn process event', async () => {
    const id = randomUUID();

    const { body: transaction } = await transactionDriver.createTransaction({
      id,
    });

    const queue = queueService.getQueue(Event.PROCESS_TRANSACTION);

    const processTransactionJob = await queueService.getJobFromSandboxJob({
      queueName: queue?.name ?? Event.PROCESS_TRANSACTION,
      id,
      log: () => undefined,
    });

    expect(processTransactionJob?.data).toEqual(
      expect.objectContaining({ id: transaction.id, webhookUrl }),
    );

    expect(processTransactionJob?.parent).toEqual(
      expect.objectContaining({ data: { id: transaction.id } }),
    );
  });

  it('/transaction(POST): should dispatch a txn update event', async () => {
    const id = randomUUID();

    const { body: transaction } = await transactionDriver.createTransaction({
      id,
    });

    const queue = queueService.getQueue(Event.UPDATE_TRANSACTION_STATUS);

    const updateTransactionStatusJob = await queueService.getJobFromSandboxJob({
      queueName: queue?.name ?? Event.UPDATE_TRANSACTION_STATUS,
      id,
      log: () => undefined,
    });

    expect(updateTransactionStatusJob?.data).toEqual(
      expect.objectContaining({ id: transaction.id }),
    );

    expect(updateTransactionStatusJob?.parent).toEqual(
      expect.objectContaining({ data: { id: transaction.id } }),
    );
  });

  it('/transaction(POST): should dispatch a client update event', async () => {
    const id = randomUUID();

    const { body: transaction } = await transactionDriver.createTransaction({
      id,
    });

    const queue = queueService.getQueue(Event.TRANSACTION_STATUS_NOTIFICATION);

    const updateTransactionStatusClientJob =
      await queueService.getJobFromSandboxJob({
        queueName: queue?.name ?? Event.TRANSACTION_STATUS_NOTIFICATION,
        id,
        log: () => undefined,
      });

    expect(updateTransactionStatusClientJob?.data).toEqual(
      expect.objectContaining({ id: transaction.id }),
    );

    expect(updateTransactionStatusClientJob?.parent).toBeNull();
  });

  it("/transaction/:id(GET): fetch a txn's status", async () => {
    const id = randomUUID();

    const createdTransaction = await transactionDriver.createTransaction({
      id,
    });

    expect(createdTransaction.body).toEqual(
      expect.objectContaining({ id, status: 'pending' }),
    );

    const transaction = await transactionDriver.getTransaction(
      createdTransaction.body.id,
    );

    expect(transaction.body).toEqual(
      expect.objectContaining({
        id,
        status: expect.stringMatching(/pending|completed|declined/) as unknown,
      }),
    );
  });
});
