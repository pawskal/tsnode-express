import express, { RequestHandler, Request } from 'express';
import Router from 'express';
import bodyParser from 'body-parser';
import Injector from './injector';
import { IController, IAuthOptions, Type, IAuthMiddleware, Response, IRoutes, IProviderDefinition } from './interfaces';
import { AuthOptions, ConfigProvider, RequestArguments } from './helpers';
import { AuthMiddleware } from './authMiddleware';

class Application {

  public get Injector(): Injector {
    return this._injector
  }

  private static _instance: Application;

  private _injector: Injector;

  private express: any;

  private authorizationProvider : IProviderDefinition;

  private enableAthorization: boolean = false;

  private authorizationOptions: AuthOptions;

  private dbProvider: IProviderDefinition;

  private configProvider: ConfigProvider;

  private controllers: Map<string, IController>;
  
  constructor() {
    this.express = express();
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this._injector = Injector.getInstance();

    this.controllers = this._injector.controllers;

    this._injector.setInstance(this);

    return Application._instance || (Application._instance = this);
  }

  public registerModule(objects: any): void {
    console.log(objects)
    Object.keys(objects).forEach((m) => console.log(m, 'registered'));
  }

  private authMiddleware(req: Request, res: Response, next: Function) : void {
    this.enableAthorization ? new AuthMiddleware(req, res, next, this.authorizationProvider.instance, this.authorizationOptions) : next();
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
    routes.forEach((routes: IRoutes, path: string) => 
      Object.keys(routes).forEach((method: string) => {
        async function handler(req: Request, res: Response, next: Function) {
          const stub = () => {};

          const before: Function = routes[method]['before'] && routes[method]['before'].handler || stub;
          const origin: Function = routes[method]['origin'] && routes[method]['origin'].handler || stub;
          const after: Function = routes[method]['after'] && routes[method]['after'].handler || stub;

          await before.apply(instance, arguments);

          res.result = await origin.call(instance, new RequestArguments(req));

          await after.apply(instance, arguments);
          res.send(res.result);
        }

        console.log('route', `/${basePath}/${path}`, 'registered');

        const authRequired: boolean = routes[method].auth === false ? false : auth;

        const authMiddleware = authRequired ? this.authMiddleware.bind(this) : function () { arguments[2].call() };

        this.express.use(`/${basePath}`, authMiddleware, Router()[method](`/${path}`, handler));
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
