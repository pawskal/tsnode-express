import http from 'http';
import { info } from 'nodejs-lite-logger';
import application from './server'

application.start((express, configProvider) => 
  http.createServer(express).listen(configProvider.port, () => 
    info('Server listening on port:', configProvider.port)))
