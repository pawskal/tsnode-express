import cors from 'cors';

import {Application, ConfigProvider} from 'tsnode-express';

import * as SomeModule from './someModule';
import * as AuthModule from './authModule';

import { AuthProvider } from './authProvider';
import { InjectedService, IInjectedService } from './external.service';
import AsyncRedis from "./asyncRedis";

const injectedService: InjectedService = new InjectedService({ 
  stub: 'injected as class'
});

function setConfig(config): Promise<void> {
  return new Promise((resolve) => 
    setTimeout(() => {
      config.test = 'test config field';
      config.secret = 'SUPER SECRET'
      config.logLevels = ['info', 'success', 'error', 'warning'];
      config.printStack = false;
      config.port = process.env.PORT;
      config.redisHost = process.env.REDIS_HOST;
      config.redisPort = process.env.REDIS_PORT;
      config.redisPassword = process.env.REDIS_PASS;
      config.transportChannel = 'example';
      resolve();
    }, 1000));
}

const application = new Application();

application
  .use(cors())
  .useConfig(setConfig)
  .inject<InjectedService>(injectedService)
    .inject<IInjectedService>('IInjectedService', async () => ({ stub: 'injected as interface' }))
    .inject<AsyncRedis>('AsyncRedis', async (config: ConfigProvider) => {
      return new AsyncRedis({ host: config.redisHost, port: config.redisPort, password: config.redisPassword });
  })
  .useAuthorizationProvider<AuthProvider>(AuthProvider)
  .registerModule(SomeModule)
  .registerModule(AuthModule)
  .disableHttp()

export default application;
