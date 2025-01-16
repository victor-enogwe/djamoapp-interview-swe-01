import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { Repository } from 'typeorm';
import type { TransactionEntity } from '../../src/modules/database/entities/transaction.entity';
import { TransactionStatus } from '../../src/modules/enums/transaction-status.enum';

export class TransactionDriver {
  private readonly server = this.app.getHttpServer();

  constructor(private readonly app: INestApplication<App>) {}

  async createTransaction(transaction: {
    id: string;
  }): Promise<
    Omit<request.Response, 'body'> & { body: { id: string; status: string } }
  > {
    return request(this.server)
      .post('/transaction')
      .send(transaction)
      .expect(201);
  }

  checkStatus(
    transactionRepository: Repository<TransactionEntity>,
    id: number,
    statuses: TransactionStatus[] = [
      TransactionStatus.COMPLETED,
      TransactionStatus.DECLINED,
    ],
  ): (
    next: (value: TransactionEntity | null) => void,
  ) => Promise<TransactionEntity | null> {
    return async (
      next: (value: TransactionEntity | null) => void,
    ): Promise<TransactionEntity | null> => {
      const created = await transactionRepository.findOneBy({ id });

      if (statuses.includes(created!.status)) next(created);

      return created;
    };
  }
}
