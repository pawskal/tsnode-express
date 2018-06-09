import http from 'http';

import { Application, IAuthOptions, IRequest, IResponse } from 'tsnode-express';

import * as SomeModule from './someModule';
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
});

application.useAuthorizationProvider(AuthProvider, (options: IAuthOptions) => {
  options.secret = 'SUPER PUPES SECRET';
})

application.registerModule(SomeModule);

application.start((express) => {
  http.createServer(express).listen(3000, () => {
    console.log('Server listening')
  })
})

export default application
