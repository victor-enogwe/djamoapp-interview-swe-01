import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { App } from 'supertest/types';
import { AppModule } from '../src/modules/app/app.module';

describe('Transaction Create Event (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it('should create a transaction in database', () => {
    throw new Error('Test not implemented');
  });

  it('should not create duplicate transactions', () => {
    throw new Error('Test not implemented');
  });
});
