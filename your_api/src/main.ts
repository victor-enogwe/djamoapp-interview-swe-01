import { startConsumer } from './consumer';
import { logger } from './modules/logger/providers/logger';
import { startProducer } from './producer';

startConsumer()
  .then(() => startProducer())
  .catch((error) => logger.error(error));
