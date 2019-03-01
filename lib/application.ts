import express from 'express';
import Router from 'express';
import bodyParser from 'body-parser';
import { NotFoundError, InternalServerError, ExtendedError, UnauthorizedError } from 'ts-http-errors';
import { success, warning, error, info } from 'nodejs-lite-logger';
import Injector from './injector';
import { IController, Type, IAuthProvider, IResponse, IRoutes, IProviderDefinition, IRequest } from './interfaces';
import { AuthOptions, ConfigProvider, RequestArguments, AuthTarget } from './helpers';

class Application {

  public get Injector(): Injector {
    return this._injector;
  }

  protected static _instance: Application;

  protected _injector: Injector;

  public express: any;

  protected router: any;

  protected authorizationProvider : IProviderDefinition<IAuthProvider>;

  protected enableAthorization: boolean = false;

  protected authorizationOptions: AuthOptions;

  protected configProvider: ConfigProvider;

  protected controllers: Map<string, IController>;

  constructor(cb?: Function) {
    this.express = express();

    this.router = Router();
    
    this._injector = Injector.getInstance();

    this.controllers = this._injector.controllers;

    this._injector.setInstance(this);

    cb ? cb(this.express) : void 0

    this.express.use('/health', this.health.bind(this));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));

    this.configProvider = new ConfigProvider({});
    this._injector.setInstance(this.configProvider);
    return Application._instance || (Application._instance = this);
  }

  public registerModule(...args): void {}

  protected async authMiddleware(req: IRequest, res: IResponse, next: Function) : Promise<void> {
    try {
      if(this.enableAthorization) {
        const token: string = req.headers[this.authorizationOptions.authorizationHeader.toLowerCase()] ||
                              req.query[this.authorizationOptions.authorizationQueryParam] ||
                              req.body[this.authorizationOptions.authorizationBodyField];
        const authTarget: AuthTarget = new AuthTarget(req, this.controllers);
        this.configProvider.logLevels.includes('info')
              && info(
                authTarget.method.toUpperCase(), '\t',
                authTarget.fullPath, '\t',
                'target: ', '\t',
                authTarget.functionName
              );
        if(!token) throw new UnauthorizedError();
        req.auth = await this.authorizationProvider.instance.verify(token, authTarget);
      }
      next();
    } catch (e) {
      this.configProvider.logLevels.includes('warning') && warning(e.name, '\t', e.message);
      res.status(e.statusCode || 500).json(e);
    }
  }

  public useAuthorizationProvider<T>(provider: Type<T>, cb?: Function) : void {
    this.enableAthorization = true;
    this._injector.set(provider);
    this.authorizationProvider = {
      name: provider.name
    };
    this.authorizationOptions = new AuthOptions();
    cb ? cb(this.authorizationOptions) : void 0;
  }

  public useConfig(cb: Function) : void {
    cb ? cb(this.configProvider) : void 0;
  }

  protected health() {
    this.configProvider.logLevels.includes('info') && info('GET', '\t', '/health');
    arguments[1].status(200)
                .json({ status: 'live' });
  }

  public handleNotFound() {
    const e: NotFoundError = new NotFoundError('Not Found');
    this.handleError(e, ...arguments)
  }

  public handleError(err, ...args: any[]);
  public handleError(err: ExtendedError, req: IRequest, res: IResponse, next: Function) {
    const { configProvider }: ConfigProvider = Application._instance;
    if(err.statusCode) {
      configProvider.logLevels.includes('warning')
        && warning(err.name, '\t', configProvider.printStack ? err : err.message);
      res.status(err.statusCode || 500).json(err);
    } else {
      configProvider.logLevels.includes('error') && error(err);
      res.status(500).json(new InternalServerError(err.message));
    }  
  }

  protected buildController(definition: IController, name: string) : void {
    const { configProvider }: ConfigProvider = Application._instance;
    definition.instance = Application._instance.Injector.resolve<any>(name);
    
    const router = Router();
    const { routes, basePath, auth, instance } = definition;

    new Map<string, IRoutes>([...routes.entries()]
      .sort(([path]: Array<any>) => path.startsWith('/:') ? 1 : -1))
      .forEach((routes: IRoutes, path: string) =>
        Object.keys(routes).forEach((method: string) => {
          async function handler(req: IRequest, res: IResponse) {
            configProvider.logLevels.includes('info')
              && info(
                method.toUpperCase(), '\t',
                `${basePath}${path}`, '\t',
                'target: ', '\t',
                routes[method]['before'] && routes[method]['before'].name || '',
                routes[method]['origin'] && routes[method]['origin'].name || '',
                routes[method]['after'] && routes[method]['after'].name || ''
              );

            let finished: boolean = false;
            res.on('finish', () => finished = true);

            const stub = () => {};

            const before: Function = routes[method]['before'] && routes[method]['before'].handler || stub;
            const origin: Function = routes[method]['origin'] && routes[method]['origin'].handler || stub;
            const after: Function = routes[method]['after'] && routes[method]['after'].handler;

            try {
              await before.apply(instance, arguments);
              res.result = await origin.call(instance, new RequestArguments(req)) || {};
              await after && after.apply(instance, arguments);
            } catch (e) {
              Application._instance.handleError(e, ...arguments);
            } finally {
              process.nextTick(() => finished ? void 0 : !after && res.send(res.result))
            }
          }

          routes[method].auth = routes[method].auth === false ? false : auth;

          const authMiddleware = routes[method].auth ?
                                 this.authMiddleware.bind(this) :
                                 function () { arguments[2].call() };
          this.express.use(basePath, router[method](path, authMiddleware, handler));
          configProvider.logLevels.includes('success')
            && success(method.toUpperCase(), '\t', `${basePath}${path}`);
        }));
  }

  public start(cb: Function) : void {
    if(this.authorizationProvider) {
      this.authorizationProvider.instance = this._injector.resolve<IAuthProvider>(this.authorizationProvider.name);
    }
    this.controllers.forEach(this.buildController.bind(this));
    this.express.use(this.handleNotFound.bind(this));
    this.express.use(this.handleError.bind(this));
    cb(this.express);
  }
}

export default Application;
