import http from 'http';

import { Application, IAuthOptions, IRequest, IResponse } from 'tsnode-express';
import { info } from 'nodejs-lite-logger';

import * as SomeModule from './someModule';
import * as AuthModule from './authModule';

import { AuthProvider } from './authProvider';

const application = new Application((express) => {
  express.use((req: IRequest, res: IResponse, next: Function) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });
});

application.useConfig((config) => {
  config.test = 'test config field';
  config.secret = 'SUPER SECRET'
  config.logLevels = ['info', 'success', 'error', 'warning'];
  config.printStack = false;
});

application.useAuthorizationProvider(AuthProvider)

application.registerModule(SomeModule);
application.registerModule(AuthModule);

application.start((express) => {
  express.listen(3000, () => {
    info('Server listening');
  })
})

export default application
