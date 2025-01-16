import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TransactionStatus } from '../../../../../../enums/transaction-status.enum';
import type { UpdateTransactionStatusJobData } from '../types';

export class UpdateTransactionPayloadDTO
  implements UpdateTransactionStatusJobData
{
  @IsUUID(4)
  readonly id: UpdateTransactionStatusJobData['id'];

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;
}
