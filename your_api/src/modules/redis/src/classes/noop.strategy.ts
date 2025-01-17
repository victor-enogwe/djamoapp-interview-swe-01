import type { CustomTransportStrategy } from '@nestjs/microservices';
import { Server } from '@nestjs/microservices';

export class NoopStrategy extends Server implements CustomTransportStrategy {
  public listen(callback: () => void): void {
    callback();
  }

  public close(): void {}

  on(): void {}

  unwrap<T>(): T {
    return [] as T;
  }
}
