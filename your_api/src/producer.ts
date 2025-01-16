import { ConfigService } from '@nestjs/config';
import { bootstrapProducer } from './bootstrap';
import { logger } from './modules/logger/providers/logger';

export async function startProducer(): Promise<void> {
  const app = await bootstrapProducer();
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('YOUR_API_PORT');

  await app.listen(PORT ?? 3200, '0.0.0.0');
}

if (require.main === module) {
  startProducer().catch((error) => logger.error(error));
}
