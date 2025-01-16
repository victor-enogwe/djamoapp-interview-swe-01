import type { TransactionStatus } from '../../../../../../enums/transaction-status.enum';

export interface ProcessTransactionJobData {
  id: string;
}

export interface ProcessTransactionJobReturnValue {
  id: string;
  status: TransactionStatus;
}

export type ProcessTransactionJob = BullmqFlowJob<ProcessTransactionJobData>;
