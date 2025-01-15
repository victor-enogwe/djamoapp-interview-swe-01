import { IsUUID } from 'class-validator';
import type { CreateTransactionJobData } from '../types';

export class CreateTransactionPayloadDTO
  implements Omit<CreateTransactionJobData, 'childrenReturnValues'>
{
  @IsUUID(4)
  readonly id: CreateTransactionJobData['id'];
}
