import TSNodeCore from '../../lib/_application';
import express, { IRouterHandler, IRouterMatcher } from 'express';
import Router from 'express';
import bodyParser from 'body-parser';
import { NotFoundError, InternalServerError, ExtendedError, UnauthorizedError } from 'ts-http-errors';
import { success, warning, error, info } from 'nodejs-lite-logger';

import Injector from '../../lib/_injector';

import { httpMeta } from './decorators'; 
import { AuthOptions, AuthTarget, RequestArguments } from './helpers';
import { ConfigProvider } from '../../lib';
import { IProviderDefinition, IAuthProvider, IController, IRequest, IResponse, IRoutes, IControllerDefinition } from './interfaces';
import { Type } from '../../lib/interfaces';

class TSNodeExpress extends TSNodeCore {

  public get Injector(): Injector {
    return this._injector;
  }

  public express: any;

  protected router: any;

  protected enableAthorization: boolean = false;

  protected authorizationOptions: AuthOptions;

  protected configProvider: ConfigProvider;

  public use: IRouterHandler<TSNodeExpress> & IRouterMatcher<TSNodeExpress>;

  protected authorizationProvider?: IProviderDefinition<IAuthProvider>;

  constructor(cb?: Function) {
    super();
    this.express = express();

    this.router = Router();

    cb ? cb(this.express) : void 0;

    this.use = function (): TSNodeExpress {
      this.express.use(...arguments)
      return this;
    };

    this.use('/health', this.health.bind(this));
    this.use(bodyParser.json());
    this.use(bodyParser.urlencoded({ extended: false }));
  }

  public get controllers(): Map<string, IControllerDefinition > {
    return httpMeta.controllers;
  }

  public registerModule(...args): TSNodeExpress {
    return this;
  }

  protected async authMiddleware(req: IRequest, res: IResponse, next: Function) : Promise<void> {
    try {
      if(this.enableAthorization) {
        const token: string = req.headers[this.authorizationOptions.authorizationHeader.toLowerCase()] ||
                              req.query[this.authorizationOptions.authorizationQueryParam] ||
                              req.body[this.authorizationOptions.authorizationBodyField];
        const authTarget: AuthTarget = new AuthTarget(req, this.controllers);
        if(!token) throw new UnauthorizedError('Unauthorized');
        req.auth = await this.authorizationProvider.instance.verify(token, authTarget);
      }
      next();
    } catch (e) {
      this.handleError(e, ...arguments);
    }
  }

  public useAuthorizationProvider<T>(provider: Type<T>, cb?: Function) : TSNodeExpress {
    this.enableAthorization = true;
    this._injector.set(provider);
    this.authorizationProvider = {
      name: provider.name
    };
    this.authorizationOptions = new AuthOptions();
    cb ? cb(this.authorizationOptions) : void 0;
    return this;
  }

  public useConfig(cb: Function) : TSNodeExpress {
    this.pendingInjections.set('ConfigProvider', cb ? cb(this.configProvider) : Promise.resolve());
    return this;
  }

  protected health() {
    this.configProvider.logLevels.includes('info') && info('GET', '\t', '/health');
    arguments[1].status(200)
                .json({ status: 'live' });
  }

  public handleNotFound() {
    this.handleError(
      new NotFoundError(`Route ${arguments[0].originalUrl} was not found`),
      ...arguments
    )
  }

  public handleError(err, ...args: any[]);
  public handleError(err: ExtendedError, req: IRequest, res: IResponse, next: Function) {
    const { configProvider }: ConfigProvider = this;
    if(err.statusCode) {
      configProvider.logLevels.includes('warning')
        && warning(err.name, '\t', configProvider.printStack ? err : err.message);
      res.status(err.statusCode || 500).json(err);
    } else {
      configProvider.logLevels.includes('error') && error(err);
      res.status(500).json(new InternalServerError(err.message));
    }  
  }

  protected buildController(definition: IControllerDefinition, name: string) : void {
    const { configProvider }: ConfigProvider = this;

    const router = Router();
    const { routes, basePath, auth } = definition;

    new Map<string, IRoutes>([...routes.entries()]
      .sort(([path]: Array<any>) => path.startsWith('/:') ? 1 : -1))
      .forEach((routes: IRoutes, path: string) =>
        Object.keys(routes).forEach((method: string) => {
          const handler = async (req: IRequest, res: IResponse) => {
            let finished: boolean = false;
            res.on('finish', () => finished = true);

            const stub = () => {};

            const before: Function = routes[method]['before'] && routes[method]['before'].handler || stub;
            const origin: Function = routes[method]['origin'] && routes[method]['origin'].handler || stub;
            const after: Function = routes[method]['after'] && routes[method]['after'].handler;

            try {
                const instance = this._injector._resolveTarget<any>(name);
                await before.call(instance, { req, res });
                res.result = await origin.call(instance, new RequestArguments(req)) || {};
                await after && after.call(instance, { req, res });
            } catch (e) {
                this.handleError(e, req, res);
            } finally {
                process.nextTick(() => finished ? void 0 : !after && res.send(res.result))
            }
          }

          routes[method].auth = routes[method].auth === false ? false : auth;

          const authMiddleware = routes[method].auth && this.authMiddleware.bind(this)

          const logMiddleware = configProvider.logLevels.includes('info')
            && function() { 
              info(
              method.toUpperCase(), '\t',
              `${basePath}${path}`, '\t',
              'target: ', '\t',
              routes[method]['before'] && routes[method]['before'].name || '',
              routes[method]['origin'] && routes[method]['origin'].name || '',
              routes[method]['after'] && routes[method]['after'].name || ''
              );
              arguments[2].call();
        }

        this.use(basePath, router[method](
          path,
          [logMiddleware, authMiddleware].filter(m => m),
          handler
        ));
        configProvider.logLevels.includes('success')
          && success(method.toUpperCase(), '\t', `${basePath}${path}`);
    }));
  }

  public async start(cb: Function) : Promise<void> {
    this.exportValue = 'express';
    super.start((...args) => {
      if(this.authorizationProvider) {
        this.authorizationProvider.instance = this._injector._resolveTarget<IAuthProvider>(this.authorizationProvider.name);
      }
  
      this.controllers.forEach(this.buildController.bind(this));
  
      this.use(this.handleNotFound.bind(this));
      this.use(this.handleError.bind(this));
      cb(...args);
    });
  }
}

export default TSNodeExpress;
