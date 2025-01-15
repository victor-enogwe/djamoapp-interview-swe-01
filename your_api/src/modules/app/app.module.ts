import { Module } from '@nestjs/common';
import { ConditionalModule, ConfigModule } from '@nestjs/config';
import { TransactionController } from '../../controllers/transaction/transaction.controller';
import { TransactionService } from '../../services/transaction.service';
import { BullboardModule } from '../bullmq/src/bullboard.module';
import { BullmqConsumerModule } from '../bullmq/src/bullmq-consumer.module';
import { BullmqProducerModule } from '../bullmq/src/bullmq-producer.module';
import { LoggerModule } from '../logger/logger.module';
import { RedisModule } from '../redis/src/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    LoggerModule,
    RedisModule,
    BullmqProducerModule,
    BullmqConsumerModule,
    ConditionalModule.registerWhen(
      BullboardModule,
      ({ NODE_ENV }) => NODE_ENV !== 'test',
    ),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class AppModule {}
