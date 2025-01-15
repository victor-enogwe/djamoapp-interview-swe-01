import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

export class WebhookDriver {
  private readonly server = this.app.getHttpServer();

  constructor(private readonly app: INestApplication<App>) {}

  async send(data: {
    id: string;
    status: string /* @TODO use status enum */;
  }): Promise<
    Omit<request.Response, 'body'> & { body: { id: string; status: string } }
  > {
    return request(this.server).post('/webhook').send(data).expect(200);
  }
}
