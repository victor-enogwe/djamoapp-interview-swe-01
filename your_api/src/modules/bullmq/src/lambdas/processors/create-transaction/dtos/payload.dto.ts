import { IsUUID } from 'class-validator';
import type { CreateTransactionJobData } from '../types';

export class CreateTransactionPayloadDTO implements CreateTransactionJobData {
  @IsUUID(4)
  readonly id: CreateTransactionJobData['id'];
}
