import express from 'express';
import Router from 'express';
import bodyParser from 'body-parser';
import Injector from './injector';
import { IController, IAuthOptions, Type, IAuthMiddleware, IResponse, IRoutes, IProviderDefinition, IRequest } from './interfaces';
import { AuthOptions, ConfigProvider, RequestArguments, AuthTarget } from './helpers';
import { AuthMiddleware } from './authMiddleware';

class Application {

  public get Injector(): Injector {
    return this._injector;
  }

  protected static _instance: Application;

  protected _injector: Injector;

  public express: any;

  protected router: any;

  protected authorizationProvider : IProviderDefinition<IAuthMiddleware>;

  protected enableAthorization: boolean = false;

  protected authorizationOptions: AuthOptions;

  protected configProvider: ConfigProvider;

  protected controllers: Map<string, IController>;
  
  constructor(cb?: Function) {
    this.express = express();

    this.express.use('/health', this.health)
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));

    this.router = Router();
    
    this._injector = Injector.getInstance();

    this.controllers = this._injector.controllers;

    this._injector.setInstance(this);

    cb ? cb(this.express) : void 0

    return Application._instance || (Application._instance = this);
  }

  public registerModule(objects: any): void {}

  protected authMiddleware(req: IRequest, res: IResponse, next: Function) : void {
    this.enableAthorization ? new AuthMiddleware(req, res, next, this.authorizationProvider.instance,
                                                 this.authorizationOptions, this.controllers) 
                            : next();
  }

  public useAuthorizationProvider<T>(provider: Type<T>, cb: Function) : void {
    this.enableAthorization = true;
    this._injector.set(provider);
    this.authorizationProvider = {
      name: provider.name
    };
    this.authorizationOptions = new AuthOptions();
    cb(this.authorizationOptions);
  }

  public useConfig(cb: Function) : void {
    const config = {};
    cb(config);
    this.configProvider = new ConfigProvider(config)
    this._injector.setInstance(this.configProvider);
  }

  protected health() {
    arguments[1].json({ status: 'live' })
  }

  protected handleNotFound() {
    arguments[1].status(400).json({ status: 404, message: 'Not Found' })
  }

  protected buildController(definition: IController, name: string) : void {
    definition.instance = Application._instance.Injector.resolve<any>(name);
    
    const { routes, basePath, auth, instance } = definition;

    new Map<string, IRoutes>([...routes.entries()]
      .sort(([path]: Array<any>) => path.startsWith('/:') ? 1 : -1))
      .forEach((routes: IRoutes, path: string) =>
        Object.keys(routes).forEach((method: string) => {
          async function handler(req: IRequest, res: IResponse, next: Function) {
            const stub = () => {};

            const before: Function = routes[method]['before'] && routes[method]['before'].handler || stub;
            const origin: Function = routes[method]['origin'] && routes[method]['origin'].handler || stub;
            const after: Function = routes[method]['after'] && routes[method]['after'].handler || stub;

            try {
              await before.apply(instance, arguments);
              res.result = await origin.call(instance, new RequestArguments(req)) || {};
              await after.apply(instance, arguments);
              res.send(res.result);
            } catch (e) {
              res.status(e.statusCode || 500).json({
                status: e.statusCode,
                message: e.message,
                type: e.name
              })
            }
          }

          routes[method].auth = routes[method].auth === false ? false : auth;

          const authMiddleware = routes[method].auth ?
                                 this.authMiddleware.bind(this) :
                                 function () { arguments[2].call() };
          console.log(method, basePath, path)
          this.express.use(basePath, this.router[method](path, authMiddleware, handler));
        }));
  }

  public start(cb: Function) : void {
    if(this.authorizationProvider) {
      this.authorizationProvider.instance = this._injector.resolve<IAuthMiddleware>(this.authorizationProvider.name);
    }
    this.controllers.forEach(this.buildController.bind(this));
    this.express.use(this.handleNotFound);
    cb(this.express);
  }
}

export default Application;
