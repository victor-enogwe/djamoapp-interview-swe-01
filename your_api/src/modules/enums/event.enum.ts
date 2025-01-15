export enum Event {
  CREATE_TRANSACTION = 'create-transaction',
  PROCESS_TRANSACTION = 'process-transaction',
  UPDATE_TRANSACTION_STATUS = 'update-transaction-status',
  TRANSACTION_STATUS_NOTIFICATION = 'transaction-status-notification',
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Event {
  export const values: Event[] = [
    Event.CREATE_TRANSACTION,
    Event.PROCESS_TRANSACTION,
    Event.UPDATE_TRANSACTION_STATUS,
    Event.TRANSACTION_STATUS_NOTIFICATION,
  ];
}
