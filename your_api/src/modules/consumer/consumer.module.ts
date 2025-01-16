import { Module } from '@nestjs/common';
import { BullmqConsumerModule } from '../bullmq/src/bullmq-consumer.module';
import { ConfigModule } from '../config/config.module';
import { LoggerModule } from '../logger/logger.module';
import { RedisModule } from '../redis/src/redis.module';

@Module({
  imports: [ConfigModule, LoggerModule, RedisModule, BullmqConsumerModule],
})
export class ConsumerModule {}
