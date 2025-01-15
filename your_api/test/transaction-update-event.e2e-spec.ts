import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { App } from 'supertest/types';
import { AppModule } from '../src/modules/app/app.module';

describe('Transaction Update Event (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it('should send txn status update to the client application', () => {
    throw new Error('Test not implemented');
  });

  it('should complete if txn status is declined or completed', () => {
    throw new Error('Test not implemented');
  });

  it('should complete if specified time elapses without valid status', () => {
    throw new Error('Test not implemented');
  });
});
