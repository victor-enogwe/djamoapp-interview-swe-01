import bootstrap from '../../bootstrap';
import { HANDLER_SERVICE } from '../../constants';
import { HandlerService } from './services/handler.service';

export default bootstrap({
  imports: [],
  providers: [{ provide: HANDLER_SERVICE, useClass: HandlerService }],
});
