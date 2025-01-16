import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { BullmqQueueService } from '../../src/modules/bullmq/src/services/bullmq-queue.service';
import { Event } from '../../src/modules/enums/event.enum';
import { TransactionStatus } from '../../src/modules/enums/transaction-status.enum';
import { ProducerModule } from '../../src/modules/producer/producer.module';
import { AppDriver } from '../drivers/app.driver';
import { TransactionDriver } from '../drivers/transaction.driver';

describe.skip('Transaction Controller (e2e)', () => {
  let app: NestFastifyApplication;
  let transactionDriver: TransactionDriver;
  let queueService: BullmqQueueService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProducerModule],
    }).compile();

    const appDriver = new AppDriver(moduleFixture);
    app = await appDriver.createNestApplication();
    transactionDriver = new TransactionDriver(app);
    queueService = app.get<BullmqQueueService>(BullmqQueueService);

    await app.init();
  });

  afterEach(async () => app.close());

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
    const start = performance.now();

    const transaction = await transactionDriver.createTransaction({
      id,
    });

    const end = performance.now();

    expect(transaction.body).toEqual(
      expect.objectContaining({ id, status: TransactionStatus.PENDING }),
    );

    expect(end - start).toBeLessThanOrEqual(200);
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
      expect.objectContaining({ id: transaction.id }),
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
  });
});
