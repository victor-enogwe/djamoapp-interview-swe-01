import type { CacheManagerStore } from 'cache-manager';
import type { Cluster, Redis } from 'ioredis';
import { get } from 'lodash';

export class RedisStore implements CacheManagerStore {
  readonly name = 'http-cache';

  constructor(
    private readonly redis: Redis | Cluster,
    private readonly options?: { ttl?: number },
  ) {}

  get client(): Redis | Cluster {
    return this.redis;
  }

  on?(event: string, listener: (...arguments_: unknown[]) => void): void {
    this.redis.on(event, listener);
  }

  async disconnect(): Promise<void> {
    return Promise.resolve(this.redis.disconnect());
  }

  isCacheable(value: unknown): boolean {
    return get(
      this.options,
      'isCacheable',
      (val: unknown) => val !== undefined && val !== null,
    )(value);
  }

  private stringify(value: unknown): string {
    return JSON.stringify(value) || '"undefined"';
  }

  async keys(pattern = '*'): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  async reset(): Promise<void> {
    await this.redis.flushall();
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  async get<T>(key: string): Promise<T | undefined> {
    const val = await this.redis.get(key);

    if (val === undefined || val === null) return undefined;

    return JSON.parse(val) as T;
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const val = this.stringify(value);

    if (!this.isCacheable(value)) {
      throw new Error(`"${val}" is not a cacheable value`);
    }

    const timeToLive = this.options?.ttl ?? ttl;

    if (timeToLive) await this.redis.setex(key, timeToLive, val);
    else await this.redis.set(key, val);
  }

  async mset(data: Record<string, unknown>, ttl?: number): Promise<void> {
    const timeToLive = this.options?.ttl ?? ttl;
    const records = Object.entries(data);

    if (timeToLive) {
      const multi = this.redis.multi();

      records.flatMap(([key, value]) => {
        const val = this.stringify(value);

        if (!this.isCacheable(value)) {
          throw new Error(`"${val}" is not a cacheable value`);
        }

        multi.setex(key, timeToLive / 1000, val);
      });

      await multi.exec();
    } else {
      await this.redis.mset(
        records.flatMap(([key, value]) => {
          const val = this.stringify(value);

          if (!this.isCacheable(value)) {
            throw new Error(`"${val}" is not a cacheable value`);
          }

          return [key, val] as [string, string];
        }),
      );
    }
  }

  async mget(...keys: string[]): Promise<unknown[]> {
    return this.redis
      .mget(...keys)
      .then((x) =>
        x.map((x) =>
          x === null || x === undefined
            ? undefined
            : (JSON.parse(x) as unknown),
        ),
      );
  }

  async mdel(key: string): Promise<void> {
    await this.redis.del(...key);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
