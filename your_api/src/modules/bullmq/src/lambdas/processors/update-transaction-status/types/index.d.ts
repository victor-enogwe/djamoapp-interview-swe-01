import type { TransactionStatus } from '../../../../../../enums/transaction-status.enum';

export interface UpdateTransactionStatusJobData {
  id: string;
  status?: TransactionStatus;
}

export interface UpdateTransactionStatusJobReturnValue {
  id: string;
  status: TransactionStatus;
}

export type UpdateTransactionStatusJob =
  BullmqFlowJob<UpdateTransactionStatusJobData>;
