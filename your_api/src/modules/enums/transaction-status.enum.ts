export enum TransactionStatus {
  PENDING = 'pending',
  DECLINED = 'declined',
  COMPLETED = 'completed',
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TransactionStatus {
  export const values: TransactionStatus[] = [
    TransactionStatus.PENDING,
    TransactionStatus.DECLINED,
    TransactionStatus.COMPLETED,
  ];
}
