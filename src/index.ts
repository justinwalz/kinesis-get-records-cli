import * as args from './args';
import * as app from './app';
import { fatal } from './console';

app.main(args.getCLIArgs()).catch(fatal);
