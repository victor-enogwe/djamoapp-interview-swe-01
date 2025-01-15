import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { FastifyAdapter } from '@bull-board/fastify';
import { BullBoardModule } from '@bull-board/nestjs';
import { Global, Module } from '@nestjs/common';
import { Event } from '../../enums/event.enum';
import { BullBoardRootModule } from './bullboard-root.module';
import { BullmqQueuesModule } from './bullmq-queues.module';

@Global()
@Module({
  imports: [
    BullmqQueuesModule.forRoot({ registerWorkers: false }),
    {
      module: BullBoardModule,
      imports: [
        BullBoardRootModule.forRoot({
          route: '/bull-board',
          adapter: FastifyAdapter,
          boardOptions: { uiConfig: { boardTitle: 'djamo-mqs' } },
        }),
      ],
      exports: [BullBoardRootModule],
    },
    BullBoardModule.forFeature(
      ...Event.values.map((topic) => ({
        name: topic,
        adapter: BullMQAdapter,
        options: {
          allowRetries: true,
          description: `${topic} queue jobs`,
          readOnlyMode: ['production', undefined].includes(
            process.env['NODE_ENV'],
          ),
        },
      })),
    ),
  ],
})
export class BullboardModule {}
