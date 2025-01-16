import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
        entities: [`${__dirname}/entities/*.{js,ts}`],
        migrations: [`${__dirname}/migrations/*.{ts, ts}`],
        installExtensions: true,
        uuidExtension: 'uuid-ossp',
      }),
      dataSourceFactory: async (options) => {
        const dataSource = new DataSource(options!);

        return dataSource.initialize();
      },
    }),
  ],
})
export class DatabaseModule {}
