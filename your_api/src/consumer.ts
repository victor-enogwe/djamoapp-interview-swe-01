import { bootstrapConsumer } from './bootstrap';
import { logger } from './modules/logger/providers/logger';

export async function startConsumer(): Promise<void> {
  const app = await bootstrapConsumer();

  await app.listen();
}

if (require.main === module) {
  startConsumer().catch((error) => logger.error(error));
}
