import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BullmqWorkerEnvProvider implements NodeJS.ProcessEnv {
  readonly NODE_ENV: NodeJS.ProcessEnv['NODE_ENV'];
  readonly TZ?: string | undefined;
  readonly REDIS_HOSTNAME?: string | undefined;
  readonly REDIS_PORT?: string | undefined;
  readonly REDIS_USERNAME?: string | undefined;
  readonly REDIS_PASSWORD?: string | undefined;
  readonly REDIS_DATABASE?: string | undefined;
  readonly REDIS_SENTINELS: string | undefined;
  readonly DB_HOST?: string | undefined;
  readonly DB_PORT?: string | undefined;
  readonly DB_USER?: string | undefined;
  readonly DB_PASSWORD?: string | undefined;
  readonly DB_NAME?: string | undefined;
  readonly DB_SYNCHRONIZE?: string | undefined;
  readonly API_URL?: string | undefined;
  readonly THIRD_PARTY_API_URL?: string | undefined;
  readonly CLIENT_API_URL?: string | undefined;
  readonly concurrency: string = '1';
  [key: string]: string | undefined;

  constructor(configService: ConfigService) {
    this.NODE_ENV = configService.getOrThrow<string>('NODE_ENV');

    this.TZ = configService.get<NodeJS.ProcessEnv['TZ']>('TZ')!;

    this.REDIS_DATABASE = configService.get<string>('REDIS_DATABASE');

    this.REDIS_PASSWORD = configService.get<string>('REDIS_PASSWORD');

    this.REDIS_HOSTNAME = configService.get<string>('REDIS_HOSTNAME');

    this.REDIS_PORT = configService.get<string>('REDIS_PORT');

    this.REDIS_USERNAME = configService.get<string>('REDIS_USERNAME');

    this.REDIS_SENTINELS = configService.get<string>('REDIS_SENTINELS');

    this.DB_HOST = configService.get<string>('DB_HOST');

    this.DB_PORT = configService.get<string>('DB_PORT');

    this.DB_USER = configService.get<string>('DB_USER');

    this.DB_PASSWORD = configService.get<string>('DB_PASSWORD');

    this.DB_NAME = configService.get<string>('DB_NAME');

    this.DB_SYNCHRONIZE = configService.get<string>('DB_SYNCHRONIZE');

    this.API_URL = configService.get<string>('YOUR_API');

    this.THIRD_PARTY_API_URL = configService.get<string>('THIRD_PARTY_API_URL');

    this.CLIENT_API_URL = configService.get<string>('CLIENT_API_URL');
  }
}
