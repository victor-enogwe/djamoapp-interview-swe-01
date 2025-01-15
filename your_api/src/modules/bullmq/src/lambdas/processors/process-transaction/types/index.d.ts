import type { JobDataFromChildReturnValues } from '../../../../../../@types/bullmq.module';
import type { TransactionStatus } from '../../../../../../enums/transaction-status.enum';

export interface ProcessTransactionJobData
  extends JobDataFromChildReturnValues {
  id: string;
}

export interface ProcessTransactionJobReturnValue {
  id: string;
  status: TransactionStatus;
}

export type ProcessTransactionJob = BullmqFlowJob<ProcessTransactionJobData>;
