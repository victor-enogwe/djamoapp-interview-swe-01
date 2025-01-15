import { ConfigService } from '@nestjs/config';
import { bootstrap } from './bootstrap';

export async function start(): Promise<void> {
  const app = await bootstrap();
  const configService = app.get(ConfigService);
  const PORT = configService.getOrThrow<number>('port');

  await app.listen(PORT ?? 4000, '0.0.0.0');
}

/* eslint-disable-next-line no-console */
start().catch((error) => console.error(error));
