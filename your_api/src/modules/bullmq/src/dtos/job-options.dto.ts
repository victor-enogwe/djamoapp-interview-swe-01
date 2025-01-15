import { IsOptional, IsUUID } from 'class-validator';
import { decorate } from 'ts-mixer';

export class JobOptionsDTO {
  @decorate(IsUUID('4'))
  @decorate(IsOptional())
  jobId: string;
}
