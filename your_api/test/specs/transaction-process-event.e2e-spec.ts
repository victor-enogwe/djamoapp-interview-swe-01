import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import type { App } from 'supertest/types';
import type { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { DatabaseModule } from '../../src/modules/database/database.module';
import { TransactionEntity } from '../../src/modules/database/entities/transaction.entity';
import { TransactionStatus } from '../../src/modules/enums/transaction-status.enum';
import { ProducerModule } from '../../src/modules/producer/producer.module';
import { TransactionDriver } from '../drivers/transaction.driver';
import { tickUntil } from '../utils';

describe('Transaction Process Event (e2e)', () => {
  let app: INestApplication<App>;
  let transactionDriver: TransactionDriver;
  let transactionRepository: Repository<TransactionEntity>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProducerModule, DatabaseModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    transactionDriver = new TransactionDriver(app);

    const datasource = app.get(DataSource);
    transactionRepository = datasource.getRepository(TransactionEntity);

    await app.init();
  });

  afterEach(async () => app.close());

  it('should process a txn using thirdparty', async () => {
    const id = randomUUID();
    const txnId = id as unknown as number;
    const status = [TransactionStatus.COMPLETED, TransactionStatus.DECLINED];

    const txn = await transactionDriver.createTransaction({ id });

    expect(txn.body).toEqual(
      expect.objectContaining({ id, status: TransactionStatus.PENDING }),
    );

    const transaction = await tickUntil<TransactionEntity | null>(
      20000,
      5000,
      transactionDriver.checkStatus(transactionRepository, txnId),
    );

    expect(transaction).toEqual(
      expect.objectContaining({
        id,
        status: expect.stringMatching(new RegExp(status.join('|'))) as unknown,
        updatedAt: expect.any(Date) as unknown,
      }),
    );
  });
});
