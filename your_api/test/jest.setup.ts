import ioRedisMock from 'ioredis-mock';

beforeAll((): void => {
  jest.mock('ioredis', () => ioRedisMock);
});

afterAll((): void => {
  jest.clearAllMocks();
});
