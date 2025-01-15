import type { JobDataFromChildReturnValues } from '../../../../../../@types/bullmq.module';
import type { TransactionStatus } from '../../../../../../enums/transaction-status.enum';

export interface CreateTransactionJobData extends JobDataFromChildReturnValues {
  id: string;
}

export interface CreateTransactionJobReturnValue {
  id: string;
  status: TransactionStatus;
}

export type CreateTransactionJob = BullmqFlowJob<CreateTransactionJobData>;
