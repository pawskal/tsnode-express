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

    return Application._instance || (Application._instance = this);
  }

  public registerModule(objects: any): void {}

  private authMiddleware(req: IRequest, res: IResponse, next: Function) : void {
    
    if(this.enableAthorization) {
      let controllerName: string;
      let controllerBasePath: string;
      let routePath: string;
      let methodName: string;
      let role = 'default';
      let roles = [];
      this.controllers.forEach((controller: IController, name: string) => {
        if(controller.basePath == req.baseUrl) {
          controllerName = name;
          controllerBasePath = controller.basePath;
          role = controller.role;
        }
      })
      const controller: IController = this.controllers.get(controllerName)
      
      controller.routes.forEach((route: IRoutes, path: string) => {
        if(path == req.route.path) {
          routePath = path;
          methodName = Object.keys(route).find((method) => method == req.route.stack[0].method)
        }
      })

      const methodDefinition = controller.routes.get(routePath)

      const authTarget = new AuthTarget({
        controller: controllerName,
        method: methodName,
        basePath: controllerBasePath,
        path: routePath,
        functionName: methodDefinition[methodName].origin.name,
        role:  methodDefinition[methodName].role || role,
        roles: methodDefinition[methodName].roles || roles,
      });

      new AuthMiddleware(req, res, next, this.authorizationProvider.instance, this.authorizationOptions, authTarget) 
    } else {
      next()
    }
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

        this.express.use(basePath, Router()[method](path, authMiddleware, handler));
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
