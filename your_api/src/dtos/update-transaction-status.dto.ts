import { IsEnum, IsUUID } from 'class-validator';
import { TransactionStatus } from '../modules/enums/transaction-status.enum';

export class UpdateTransactionStatusDTO {
  @IsUUID(4)
  readonly id: string;

  @IsEnum(TransactionStatus)
  status: TransactionStatus;
}
