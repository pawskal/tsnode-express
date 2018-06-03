import http from 'http';

import Application from '../lib/application';

import * as UserModule from './modules';
import { IAuthOptions } from '../lib/interfaces';
import { AuthProvider } from './modules/authProvider';

const application = new Application();

application.useConfig((config) => {
  config.test = 'test config field';
});

application.useAuthorizationProvider(AuthProvider, (options: IAuthOptions) => {
  options.secret = 'SUPER PUPES SECRET';
})

application.registerModule(UserModule);

application.start((express) => {
  express.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });
  
  http.createServer(express).listen(3000, () => {
    console.log('Server listening')
  })
})

export default application
