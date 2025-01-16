import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      ignoreEnvVars: true,
      envFilePath: resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        `.env.${process.env['NODE_ENV'] ?? 'local'}`,
      ),
    }),
  ],
})
export class ConfigModule {}
