import { Injectable } from '@nestjs/common';
import type { DefaultJobOptions } from 'bullmq';

@Injectable()
export class BullmqDefaultJobOptionsOptionsProvider
  implements DefaultJobOptions
{
  readonly attempts = 3;
  readonly delay = 100;
  readonly removeOnComplete = 1000;
  readonly removeOnFail = 5000;
  readonly backoff = {
    type: 'exponential',
    delay: 5000,
  };
}
