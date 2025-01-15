import { IsUUID } from 'class-validator';
import type { UpdateTransactionStatusJobData } from '../types';

export class ProcessTransactionPayloadDTO
  implements Omit<UpdateTransactionStatusJobData, 'childrenReturnValues'>
{
  @IsUUID(4)
  readonly id: UpdateTransactionStatusJobData['id'];
}
