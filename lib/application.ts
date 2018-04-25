import express from 'express';
import Router from 'express';
import bodyParser from 'body-parser';
import { Injector } from './injector';

// import secret from '../example/secret';
// import jwt from 'jsonwebtoken';

interface Type<T> {
  new(...args: any[]): T;
}

export interface IAuthProvider {
  verify(data: any): IVerifyResponse;
}
export interface IVerifyResponse{
  verify : boolean,
  data?: any
}
interface IController {
  instance?: any;
  basePath?: string;
  routes?: Map<string, IRoutes>;
}

interface IMethod {
  name?: string
  handler?: Function
}

interface IMethodSet {
  origin?: IMethod
}

interface IRoutes {
  get?: IMethodSet;
  post?: IMethodSet;
  put?: IMethodSet;
  patch?: IMethodSet;
  delete?: IMethodSet;
}

class Application {
  public static get Instance(): Application {
    return this._instance || (this._instance = new Application());
  };

  public get Injector(): Injector {
    return this._injector
  }

  private _injector: Injector;

  private static _instance: Application;

  private app: any;

  private authorizationProvider : any;

  private authorizationControllers: any = [];

  private enableAthorization: boolean = false;

  private authorizationOptions: any = {};

  private dbProvider: any;

  private controllers: Map<string, IController> = new Map<string, IController>()
  
  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this._injector = Injector.getInstance();

    this.controllers = this._injector.controllers;

    return Application._instance || (Application._instance = this);
  }

  registerModule(modul): void {
    Object.keys(modul).forEach((m) => console.log(m, 'registered'))
  }

  private authMiddleware(req,res,next) : void {
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

  public static Authorization (target) : void {
    console.log(target.name, 'need authorization')
    Application._instance.authorizationControllers.push(target);
  }

  private buildController(definition: IController, name) {
    definition.instance = Application._instance.Injector.resolve<any>(name);
    definition.routes.forEach((routes, path) => {
      Object.keys(routes).forEach((method) => {
        async function handler(req, res, next) {
          const stub = () => console.log('stub');

          const afterStub = (result) => {
            res.json({data: result})
          }

          const before = routes[method]['before'] || stub;
          const origin = routes[method]['origin'].handler || stub; 
          const after = routes[method]['after'] || afterStub; 
          
          console.log('before')
          await before.call(definition.instance, {req, res, next})
          console.log('origin')
          const result = await origin.apply(definition.instance, arguments)
          console.log('after')
          await after.call(definition.instance, result)
        }

        console.log(`/${definition.basePath}`,`/${path}`,handler)

        this.authorizationControllers.indexOf(name) ?
        this.app.use(`/${definition.basePath}`, this.authMiddleware.bind(this), Router()[method](`/${path}`, handler)) :
        this.app.use(`/${definition.basePath}`,Router()[method](`/${path}`, handler))            

        this.app.use(`/${definition.basePath}`, this.authMiddleware.bind(this), Router()[method](`/${path}`, handler))
      })
    })
  }

  public static configure(cb: Function) {
    const instance = Application.Instance;
    cb(instance)
  }

  public static start(cb: Function) {
    const instance = Application.Instance;
    Application._instance.build.call(instance);
    cb(instance.app);
  }
}

export default Application;