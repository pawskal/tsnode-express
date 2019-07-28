import http from 'http';
import application from './server';
application.start((express, configProvider) =>{
  http.createServer(express).listen(configProvider.port, () => {})
})
