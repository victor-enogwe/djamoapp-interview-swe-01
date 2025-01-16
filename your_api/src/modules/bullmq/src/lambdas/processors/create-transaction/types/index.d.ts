import type { TransactionStatus } from '../../../../../../enums/transaction-status.enum';

export interface CreateTransactionJobData {
  id: string;
}

export interface CreateTransactionJobReturnValue {
  id: string;
  status: TransactionStatus;
}

export type CreateTransactionJob = BullmqFlowJob<CreateTransactionJobData>;
