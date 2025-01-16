import { Module } from '@nestjs/common';
import { ConditionalModule } from '@nestjs/config';
import { TransactionController } from '../../controllers/transaction/transaction.controller';
import { WebhookController } from '../../controllers/webhook/webhook.controller';
import { TransactionService } from '../../services/transaction.service';
import { BullboardModule } from '../bullmq/src/bullboard.module';
import { BullmqProducerModule } from '../bullmq/src/bullmq-producer.module';
import { ConfigModule } from '../config/config.module';
import { LoggerModule } from '../logger/logger.module';
import { RedisModule } from '../redis/src/redis.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    RedisModule,
    BullmqProducerModule,
    ConditionalModule.registerWhen(
      BullboardModule,
      ({ NODE_ENV }) => NODE_ENV !== 'test',
      { debug: false },
    ),
  ],
  controllers: [TransactionController, WebhookController],
  providers: [TransactionService],
})
export class ProducerModule {}
