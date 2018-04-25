import http from 'http';

import Application from '../lib/application';

Application.start((express, app) => {
  express.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });
  
  http.createServer(express).listen(3000, () => {
    console.log('!!!!!!!!!!!!!!!!!!')
  })
})

// Application.Instance.registerModule(require('./modules/user'));
// Application.Instance.registerModule(require('./modules/orders'));



