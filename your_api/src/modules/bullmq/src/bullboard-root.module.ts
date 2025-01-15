import { createBullBoard } from '@bull-board/api';
import { FastifyAdapter as BullFastifyAdapter } from '@bull-board/fastify';
import {
  BULL_BOARD_ADAPTER,
  BULL_BOARD_INSTANCE,
  BULL_BOARD_OPTIONS,
  type BullBoardModuleOptions,
} from '@bull-board/nestjs';
import {
  DynamicModule,
  Global,
  Inject,
  MiddlewareConsumer,
  Module,
  NestMiddleware,
  Provider,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';

@Global()
@Module({})
export class BullBoardRootModule {
  constructor(
    private readonly adapterHost: HttpAdapterHost<FastifyAdapter>,
    @Inject(BULL_BOARD_ADAPTER)
    private readonly adapter: BullFastifyAdapter,
    @Inject(BULL_BOARD_OPTIONS)
    private readonly options: BullBoardModuleOptions,
  ) {}

  private addForwardSlash(path: string): string {
    return path.startsWith('/') || path === '' ? path : `/${path}`;
  }

  configure(consumer: MiddlewareConsumer): MiddlewareConsumer {
    const fastify = this.adapterHost.httpAdapter.getInstance();
    const prefix = this.addForwardSlash(this.options.route);

    this.adapter.setBasePath(prefix);

    fastify.register(this.adapter.registerPlugin(), { prefix, basePath: '' });

    return consumer
      .apply(this.options.middleware as NestMiddleware['use'])
      .forRoutes(this.options.route);
  }

  static forRoot(options: BullBoardModuleOptions): DynamicModule {
    const serverAdapter = new options.adapter();

    const bullBoardProvider: Provider = {
      provide: BULL_BOARD_INSTANCE,
      useFactory: () =>
        createBullBoard({
          queues: [],
          serverAdapter: serverAdapter,
          options: options.boardOptions,
        }),
    };

    const serverAdapterProvider: Provider = {
      provide: BULL_BOARD_ADAPTER,
      useFactory: () => serverAdapter,
    };

    const optionsProvider: Provider = {
      provide: BULL_BOARD_OPTIONS,
      useValue: options,
    };

    return {
      module: BullBoardRootModule,
      global: true,
      imports: [],
      providers: [serverAdapterProvider, optionsProvider, bullBoardProvider],
      exports: [serverAdapterProvider, bullBoardProvider, optionsProvider],
    };
  }
}
