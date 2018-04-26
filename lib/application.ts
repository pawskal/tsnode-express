import express from 'express';
import Router from 'express';
import bodyParser from 'body-parser';
import { Injector } from './injector';
import { IController, Type } from './interfaces';

// import secret from '../example/secret';
// import jwt from 'jsonwebtoken';

class Application {
  public get Injector(): Injector {
    return this._injector
  }

  private _injector: Injector;

  private static _instance: Application;

  private express: any;

  private authorizationProvider : any;

  private authorizationControllers: any = [];

  private enableAthorization: boolean = false;

  private authorizationOptions: any = {};

  private dbProvider: any;

  private controllers: Map<string, IController> = new Map<string, IController>()
  
  constructor() {
    this.express = express();
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this._injector = Injector.getInstance();

    this.controllers = this._injector.controllers;

    return Application._instance || (Application._instance = this);
  }

  public registerModule(modul): void {
    Object.keys(modul).forEach((m) => console.log(m, 'registered'))
  }

  private authMiddleware(req, res, next) : void {
    if(this.enableAthorization) {
      
      // const token = req.headers[this.authorizationOptions.header];
      // // const decoded = jwt.verify(token,secret);
      // // const verifyResult = this.authorizationProvider.verify(decoded);
      
      // if(verifyResult.verify){
      //   req.data = verifyResult.data;
      //   next();
      // }
      // else{
      //   res.sendStatus(401);
      // }
    } else {
      next();
    }
  }

  public useAuthorizationProvider<T>(provider: Type<T>, cb:any) {
    this.enableAthorization = true;
    this._injector.set(provider);
    this.authorizationProvider = this._injector.resolve<any>(provider.name);
    cb(this.authorizationOptions);    
  }

  public async useDBProvider<T>(provider: Type<T>) {
    this._injector.set(provider);
    this.dbProvider = this._injector.resolve<any>(provider.name);
  }

  

  private build() {
    this.controllers.forEach(this.buildController.bind(this))
  }

  private buildController(definition: IController, name) {
    definition.instance = Application._instance.Injector.resolve<any>(name);
    definition.routes.forEach((routes, path) => {
      Object.keys(routes).forEach((method) => {
        async function handler(req, res, next) {
          const stub = () => console.log('stub');

          const before = routes[method]['before'] || stub;
          const origin = routes[method]['origin'].handler || stub; 
          const after = routes[method]['after'] || stub; 

          await before.apply(definition.instance, arguments)

          req.result = await origin.apply(definition.instance, arguments)

          await after.apply(definition.instance, arguments)
          res.send(req.result)
        }

        console.log(`/${definition.basePath}/${path}`, 'registered')

        let authRequired = routes[method].auth === false ? false : definition.auth;

        const authMiddleware = false ? this.authMiddleware.bind(this) : function () { arguments[2].call() };

        this.express.use(`/${definition.basePath}`, authMiddleware, Router()[method](`/${path}`, handler))
      })
    })
  }

  public start(cb: Function) {
    this.build();
    cb(this.express);
  }
}

export default Application;