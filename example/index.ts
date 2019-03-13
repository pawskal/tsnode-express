import http from 'http';

import { Application, IAuthOptions, IRequest, IResponse } from 'tsnode-express';
import { info } from 'nodejs-lite-logger';

import * as SomeModule from './someModule';
import * as AuthModule from './authModule';

import redis, { RedisClient } from 'redis';

import { AuthProvider } from './authProvider';

class RedisService extends RedisClient {
  constructor() {
    super({
      host: 'redis-14061.c14.us-east-1-3.ec2.cloud.redislabs.com',
      port: 14061,
      password: 'NQh66zuuYvJW1oQ72UIRKD5PTKuMQDJT',
      url: 'redis://redis-14061.c14.us-east-1-3.ec2.cloud.redislabs.com:14061?password=NQh66zuuYvJW1oQ72UIRKD5PTKuMQDJT'
    });
    console.dir('$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
    // Object.assign(this, redis.createClient({}))
  }
}

type IRedis = RedisClient;

const client = new RedisService();

// client.keys("*", function() {
//   console.log(arguments)
// })
(express) => {
  express.use();
}

const application = new Application();

application.use((_req: IRequest, res: IResponse, next: Function) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  })
  // .inject<RedisService>(client)
  .inject<IRedis>('IRedis', void 0, () => redis.createClient({
    host: 'redis-14061.c14.us-east-1-3.ec2.cloud.redislabs.com',
    port: 14061,
    password: 'NQh66zuuYvJW1oQ72UIRKD5PTKuMQDJT',
    url: 'redis://redis-14061.c14.us-east-1-3.ec2.cloud.redislabs.com:14061?password=NQh66zuuYvJW1oQ72UIRKD5PTKuMQDJT'
  }))
  .useConfig((config) => {
    config.test = 'test config field';
    config.secret = 'SUPER SECRET'
    config.logLevels = ['info', 'success', 'error', 'warning'];
    config.printStack = false;
  })
  .useAuthorizationProvider(AuthProvider)
  .registerModule(SomeModule)
  .registerModule(AuthModule)
  .start((express) => {
    http.createServer(express).listen(3000, () => {
      info('Server listening');
    })
  })

export default application
