import { DatabaseModule } from '../../../../../database/database.module';
import bootstrap from '../../bootstrap';
import { HANDLER_SERVICE } from '../../constants';
import { HandlerService } from './services/handler.service';

export default bootstrap({
  imports: [DatabaseModule],
  providers: [{ provide: HANDLER_SERVICE, useClass: HandlerService }],
});
