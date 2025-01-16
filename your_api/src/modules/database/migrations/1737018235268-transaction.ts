/* eslint-disable max-len */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Transaction1737018235268 implements MigrationInterface {
  name = 'Transaction1737018235268';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"public\".\"transaction_entity_status_enum\" AS ENUM('pending', 'declined', 'completed')",
    );
    await queryRunner.query(
      'CREATE TABLE "transaction_entity" ("id" uuid NOT NULL, "status" "public"."transaction_entity_status_enum" NOT NULL DEFAULT \'pending\', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "update_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_6f9d7f02d8835ac9ef1f685a2e8" PRIMARY KEY ("id"))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "transaction_entity"');
    await queryRunner.query(
      'DROP TYPE "public"."transaction_entity_status_enum"',
    );
  }
}
