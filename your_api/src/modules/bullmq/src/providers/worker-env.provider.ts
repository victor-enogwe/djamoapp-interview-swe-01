import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BullmqWorkerEnvProvider implements NodeJS.ProcessEnv {
  readonly NODE_ENV: NodeJS.ProcessEnv['NODE_ENV'];
  readonly TZ?: string | undefined;
  readonly REDIS_PASSWORD?: string | undefined;
  readonly THIRD_PARTY_API_URL?: string | undefined;
  readonly CLIENT_API_URL?: string | undefined;
  readonly concurrency: string = '1';
  [key: string]: string | undefined;

  constructor(configService: ConfigService) {
    this.NODE_ENV = configService.getOrThrow<string>('NODE_ENV');

    this.TZ = configService.get<NodeJS.ProcessEnv['TZ']>('TZ')!;

    this.REDIS_PASSWORD = configService.get<string>('REDIS_PASSWORD');

    this.THIRD_PARTY_API_URL = configService.get<string>('THIRD_PARTY_API_URL');

    this.CLIENT_API_URL = configService.get<string>('CLIENT_API_URL');
  }
}
