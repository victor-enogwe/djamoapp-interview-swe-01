import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BullmqWorkerEnvProvider implements NodeJS.ProcessEnv {
  readonly NODE_ENV: NodeJS.ProcessEnv['NODE_ENV'];
  readonly TZ?: string | undefined;
  readonly REDIS_PASSWORD?: string | undefined;
  readonly concurrency: string = '1';
  [key: string]: string | undefined;

  constructor(configService: ConfigService) {
    this.NODE_ENV = configService.getOrThrow<string>('NODE_ENV');

    this.TZ = configService.get<NodeJS.ProcessEnv['TZ']>('TZ')!;

    this.REDIS_PASSWORD = configService.get<string>('REDIS_PASSWORD');
  }
}
