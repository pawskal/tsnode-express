import cors from 'cors';

import { Application } from 'tsnode-express';

import * as SomeModule from './someModule';
import * as AuthModule from './authModule';

import redis from 'redis';

import { AuthProvider } from './authProvider';
import { InjectedService, IInjectedService } from './external.service';

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
      resolve();
    }, 1000));
}

const application = new Application();

application
  .use(cors())
  .useConfig(setConfig)
  .inject<InjectedService>(injectedService)
  .inject<IInjectedService>('IInjectedService', async () => ({ stub: 'injected as interface' }))
  .useAuthorizationProvider<AuthProvider>(AuthProvider)
  .registerModule(SomeModule)
  .registerModule(AuthModule)

export default application;
