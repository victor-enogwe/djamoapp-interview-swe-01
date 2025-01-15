import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionController } from '../../controllers/transaction/transaction.controller';
import { TransactionService } from '../../services/transaction.service';
import { LoggerModule } from '../logger/logger.module';
import { RedisModule } from '../redis/src/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    LoggerModule,
    RedisModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class AppModule {}
