import express from 'express';
import Router from 'express';
import bodyParser from 'body-parser';
import { Injector } from './injector';

import secret from '../example/secret';
import jwt from 'jsonwebtoken';

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

class Application {
  
  public static get Instance(): Application {
    return this._instance || (this._instance = new Application());
  };

  public get Injector(): Injector {
    return this._injector
  }

  private _injector: Injector;

  private static _instance: Application;

  public app: any;

  private routes: any = {};

  private authorizationProvider : any;

  private authorizationControllers: any = [];

  private enableAthorization: boolean = false;

  private authorizationOptions: any = {};

  private dbProvider: any;
  
  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this._injector = new Injector(this);
    return Application._instance || (Application._instance = this);
  }

  registerModule(modul): void {
    // console.log(modul.name)
  }

  private authMiddleware(req,res,next) : void {
    if(this.enableAthorization) {
      const token = req.headers[this.authorizationOptions.header];
      const decoded = jwt.verify(token,secret);
      const verifyResult = this.authorizationProvider.verify(decoded);
      
      if(verifyResult.verify){
        req.data = verifyResult.data;
        next();
      }
      else{
        res.sendStatus(401);
      }
    } else {
      next();
    }
  }

  public useAuthorizationProvider<T>(provider: Type<T>, cb:any) {

    this.enableAthorization = true;
    this._injector.set('services', provider);
    this.authorizationProvider = this._injector.resolve<any>(provider.name);

    cb(this.authorizationOptions);    
  }

  public async useDBProvider<T>(provider: Type<T>) {
    this._injector.set('services', provider);
    this.dbProvider = this._injector.resolve<any>(provider.name);
  }

  private defineRoute(method, target, path, fname, descriptor) : void {
    // console.log('difine route', method, path, target.name)
    
    const controller = this.routes[target.constructor.name] ?
                       this.routes[target.constructor.name] : 
                       this.routes[target.constructor.name] = {};


    const tpath = controller[path] ? controller[path] : controller[path] = {};
    
    const met = tpath[method] ? tpath[method] : tpath[method] = {};

    met.origin = {
      name: fname,
      value: descriptor.value,
    }
  }

  public static Controller(basePath) : Function {
    return (target) : void => {
    // console.log('difine controller', target.name)
      Application._instance.Injector.set('services', target);
      const instance = Application._instance.Injector.resolve<any>(target.name);
      Object.keys(Application._instance.routes[target.name]).forEach(route => {
        // console.log(route, 'route')
        Object.keys(Application._instance.routes[target.name][route]).forEach((method) => {
          // console.log(method, 'method')
          async function handler(req, res, next) {
            const stub = () => console.log('stub');

            const afterStub = (result) => {
              res.json({data: result})
            }

            const before = Application._instance.routes[target.name][route][method]['before'] || stub;
            const origin = Application._instance.routes[target.name][route][method]['origin'].value || stub; 
            const after = Application._instance.routes[target.name][route][method]['after'] || afterStub; 
            
            console.log('before')
            await before.call(instance, {req, res, next})
            console.log('origin')
            const result = await origin.apply(instance, arguments)
            console.log('after')
            await after.call(instance, result)
          }

          Application._instance.authorizationControllers.indexOf(target) ?
          Application._instance.app.use(`/${basePath}`, Application._instance.authMiddleware.bind(Application._instance), Router()[method](`/${route}`, handler)) :
          Application._instance.app.use(`/${basePath}`,Router()[method](`/${route}`, handler))            
        })
      });
    }
  }

  public static Authorization (target) : void {
    console.log(target.name, 'need authorization')
    Application._instance.authorizationControllers.push(target);
  }

  public static Service (target) : void {
    Application._instance.Injector.set('services', target);
  }

  public static Get  = (path) : Function => (target, fname, descriptor) : void => {
    Application._instance.defineRoute('get', target, path, fname, descriptor);
  }

  public static Post = (path) : Function => (target, fname, descriptor) : void => {
    Application._instance.defineRoute('post', target, path, fname, descriptor);
  }

  public static Put = (path) : Function => (target, fname, descriptor) : void => {
    Application._instance.defineRoute('patch', target, path, fname, descriptor);
  }

  public static Patch = (path) : Function => (target, fname, descriptor) : void => {
    Application._instance.defineRoute('patch', target, path, fname, descriptor);
  }

  public static Delete = (path) : Function => (target, fname, descriptor) : void => {
    Application._instance.defineRoute('delete', target, path, fname, descriptor);
  }

  private build() {

  }

  public static configure(cb){
    cb(Application._instance);
  } 

  public static start(cb) {
    Application._instance.build.call(Application._instance);
    cb(Application._instance.app);
  }
}

export default Application;