import type { TransactionStatus } from '../enums/transaction-status.enum';

export type Class<T, Arguments extends unknown[] = any[]> = {
  prototype: Pick<T, keyof T>;
  new (...arguments_: Arguments): T;
};

export interface Transaction {
  id: string;
  status: TransactionStatus;
}
