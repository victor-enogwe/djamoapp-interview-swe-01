import type { JobDataFromChildReturnValues } from '../../../../../../@types/bullmq.module';
import type { TransactionStatus } from '../../../../../../enums/transaction-status.enum';

export interface UpdateTransactionStatusJobData
  extends JobDataFromChildReturnValues {
  id: string;
}

export interface UpdateTransactionStatusJobReturnValue {
  id: string;
  status: TransactionStatus;
}

export type UpdateTransactionStatusJob =
  BullmqFlowJob<UpdateTransactionStatusJobData>;
