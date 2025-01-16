import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { TransactionStatus } from '../../src/modules/enums/transaction-status.enum';

export class WebhookDriver {
  private readonly server = this.app.getHttpServer();

  constructor(private readonly app: INestApplication<App>) {}

  async send(data: {
    id: string;
    status: TransactionStatus;
  }): Promise<Omit<request.Response, 'body'> & { body: undefined }> {
    return request(this.server).post('/webhook').send(data).expect(200);
  }
}
