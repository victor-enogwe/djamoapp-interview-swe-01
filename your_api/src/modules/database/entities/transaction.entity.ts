import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TransactionStatus } from '../../enums/transaction-status.enum';

@Entity()
export class TransactionEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus.values,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({
    name: 'update_at',
    type: 'timestamptz',
    nullable: true,
  })
  updatedAt?: Date;
}
