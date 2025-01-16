import events from 'node:events';
import { bootstrapConsumer } from './bootstrap';
import { logger } from './modules/logger/providers/logger';

export async function startConsumer(): Promise<void> {
  events.EventEmitter.defaultMaxListeners = 100;

  const app = await bootstrapConsumer();

  await app.listen();
}

if (require.main === module) {
  startConsumer().catch((error) => logger.error(error));
}
