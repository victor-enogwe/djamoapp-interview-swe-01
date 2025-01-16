import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { sync } from 'fast-glob';
import { resolve } from 'node:path';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: sync(resolve(__dirname, '..', '..', '..', '..', '.env*')),
    }),
  ],
})
export class ConfigModule {}
