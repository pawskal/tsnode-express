import http from 'http';

import { Application, IAuthOptions, IRequest, IResponse } from 'tsnode-express';

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
});

application.useAuthorizationProvider(AuthProvider)

application.registerModule(SomeModule);
application.registerModule(AuthModule);

application.start((express) => {
  // console.log(express._router)
  http.createServer(express).listen(3000, () => {
    console.log('Server listening')
  })
})

export default application
