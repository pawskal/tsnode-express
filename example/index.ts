import http from 'http';

import Application from '../lib/application';

import * as UserModule from './modules'

Application.configure((app: Application) => {
  app.registerModule(UserModule);
})

Application.start((express) => {
  express.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });
  
  http.createServer(express).listen(3000, () => {
    console.log('!!!!!!!!!!!!!!!!!!')
  })
})




