import express from 'express';
import Router from 'express';
import bodyParser from 'body-parser';
import Injector from './injector';
import { IController, IAuthOptions, Type, IAuthMiddleware, IResponse, IRoutes, IProviderDefinition, IRequest } from './interfaces';
import { AuthOptions, ConfigProvider, RequestArguments, AuthTarget } from './helpers';
import { AuthMiddleware } from './authMiddleware';
import HttpClient from './httpClient';

class Application {

  public get Injector(): Injector {
    return this._injector;
  }

  private static _instance: Application;

  private _injector: Injector;

  private express: any;

  private authorizationProvider : IProviderDefinition<IAuthMiddleware>;

  private enableAthorization: boolean = false;

  private authorizationOptions: AuthOptions;

  private dbProvider: IProviderDefinition<any>;

  private configProvider: ConfigProvider;

  private controllers: Map<string, IController>;
  
  constructor() {
    this.express = express();
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this._injector = Injector.getInstance();

    this.controllers = this._injector.controllers;

    this._injector.setInstance(this);
    this._injector.setInstance(new HttpClient());
    this.router = Router();

    return Application._instance || (Application._instance = this);
  }

  public registerModule(objects: any): void {}

  private authMiddleware(req: IRequest, res: IResponse, next: Function) : void {
    
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

  public useDBProvider<T>(provider: Type<T>) : void {
    this._injector.set(provider);
    this.dbProvider = {
      name: provider.name
    }
    this.dbProvider = this._injector.resolve<any>(provider.name);
  }

  public useConfig(cb: Function) : void {
    const config = {};
    cb(config);
    this.configProvider = new ConfigProvider(config)
    this._injector.setInstance(this.configProvider);
  }

  private buildController(definition: IController, name: string) : void {
    definition.instance = Application._instance.Injector.resolve<any>(name);
    const { routes, basePath, auth, instance } = definition;
    const sortedRoutes = new Map<string, IRoutes>();
    const sortedKeys = [...routes.entries()];

    sortedKeys
      .sort((a: Array) => a[0].startsWith('/:') ? 1 : -1)
      .forEach((a) => sortedRoutes.set(a[0], routes.get(a[0])));

    sortedRoutes.forEach((routes: IRoutes, path: string) =>
      Object.keys(routes).forEach((method: string) => {
        async function handler(req: IRequest, res: IResponse, next: Function) {
          const stub = () => {};

          const before: Function = routes[method]['before'] && routes[method]['before'].handler || stub;
          const origin: Function = routes[method]['origin'] && routes[method]['origin'].handler || stub;
          const after: Function = routes[method]['after'] && routes[method]['after'].handler || stub;

          await before.apply(instance, arguments);

          res.result = await origin.call(instance, new RequestArguments(req));

          await after.apply(instance, arguments);
          res.send(res.result);
        }

        routes[method].auth = routes[method].auth === false ? false : auth;

        const authMiddleware = routes[method].auth ? this.authMiddleware.bind(this) : function () { arguments[2].call() };

        console.log(basePath, method, path)

        this.express.use(basePath, this.router[method](path, authMiddleware, handler));
      }));
  }

  public start(cb: Function) : void {
    if(this.dbProvider) {
      this.dbProvider = this._injector.resolve<any>(this.dbProvider.name);
    }
    if(this.authorizationProvider) {
      this.authorizationProvider.instance = this._injector.resolve<IAuthMiddleware>(this.authorizationProvider.name);
    }
    this.controllers.forEach(this.buildController.bind(this));
    cb(this.express);
  }
}

export default Application;
