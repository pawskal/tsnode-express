import express from 'express';
import bodyParser from 'bodyParser';
import path from 'path';
import http from 'http';
import Application from '../lib/application';


const { app } = Application.Instance;

// Application.Instance.registerModule(require('./modules/user'));
// Application.Instance.registerModule(require('./modules/orders'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

http.createServer(app).listen(3000, () => {
  console.log('!!!!!!!!!!!!!!!!!!')
})

export default app;
