import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

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

  async getTransaction(
    id: string,
  ): Promise<
    Omit<request.Response, 'body'> & { body: { id: string; status: string } }
  > {
    return request(this.server).get(`/transaction/${id}`).expect(200);
  }
}
