import { ConfigService } from '@nestjs/config';
import { bootstrap } from './bootstrap';
import { logger } from './modules/logger/providers/logger';

export async function start(): Promise<void> {
  const app = await bootstrap();
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('YOUR_API_PORT');

  await app.listen(PORT ?? 3200, '0.0.0.0');
}

start().catch((error) => logger.error(error));
