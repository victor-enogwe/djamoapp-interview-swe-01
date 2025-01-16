import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from './database.module';

@Module({ imports: [ConfigModule, DatabaseModule] })
class DataSourceModule {}

export default NestFactory.createApplicationContext(DataSourceModule, {
  logger: false,
  abortOnError: true,
})
  .then((app) => app.get(DataSource))
  .then(async (datasource) => {
    await datasource.destroy();

    return datasource;
  });
