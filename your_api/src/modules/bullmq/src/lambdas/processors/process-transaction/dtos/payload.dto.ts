import { IsUUID } from 'class-validator';
import type { ProcessTransactionJobData } from '../types';

export class ProcessTransactionPayloadDTO
  implements Omit<ProcessTransactionJobData, 'childrenReturnValues'>
{
  @IsUUID(4)
  readonly id: ProcessTransactionJobData['id'];
}
