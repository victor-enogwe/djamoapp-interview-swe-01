import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { App } from 'supertest/types';
import { AppModule } from '../src/modules/app/app.module';

describe('Transaction Process Event (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it('should process a txn using thirdparty', () => {
    throw new Error('Test not implemented');
  });

  it('should complete processing if txn exists in third party', () => {
    throw new Error('Test not implemented');
  });

  it('should fail and retry processing if third party throws an error', () => {
    throw new Error('Test not implemented');
  });

  it('should handle timeout cases where third party throws error 504', () => {
    throw new Error('Test not implemented');
  });
});
