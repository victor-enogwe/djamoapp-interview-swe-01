import { Injectable } from '@nestjs/common';
import { BullmqFlowJob } from '../../../@types/bullmq.module';
import { Event } from '../../../enums/event.enum';
import { BullmqProducerService } from './bullmq-producer.service';

@Injectable()
export class BullmqCreateJobService {
  constructor(private readonly bullmqProducerService: BullmqProducerService) {}

  createTransaction(): BullmqFlowJob {
    return this.bullmqProducerService.createFlowJob({
      name: this.bullmqProducerService.getJobName(Event.CREATE_TRANSACTION),
      queueName: Event.CREATE_TRANSACTION,
      data: {},
      opts: { jobId: '', failParentOnFailure: true },
    });
  }
}
