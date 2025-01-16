import { randomUUID } from 'crypto';
import ioRedisMock from 'ioredis-mock';
import { type DataSourceOptions } from 'typeorm';
import db from '../src/modules/database/config';

const database: DataSourceOptions['database'] = `djamo-test-${randomUUID()}`;

beforeAll(async () => {
  jest.mock('ioredis', () => ioRedisMock);

  const dbConfig = await db;
  const datasource = await dbConfig.initialize();
  const queryRunner = datasource.createQueryRunner();

  await queryRunner.createDatabase(database, true);

  process.env['DB_NAME'] = database;

  await datasource.destroy();
});

afterAll(async () => {
  jest.clearAllMocks();

  const dbConfig = await db;
  const datasource = await dbConfig.initialize();
  const queryRunner = datasource.createQueryRunner();

  await queryRunner.query(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`);

  await datasource.destroy();
});
