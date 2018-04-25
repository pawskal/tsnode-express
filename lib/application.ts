import express from 'express';
import Router from 'express';
import bodyParser from 'body-parser';
import { Injector } from './injector';

interface Type<T> {
  new(...args: any[]): T;
}

interface IAuthProvider {
  verify(): any;
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

  private enableAthorization: boolean = false;

  private dbProvider: any;
  
  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this._injector = new Injector(this);
    Application._instance = this;
  }

  registerModule(modul): void {
    // console.log(modul.name)
  }

  private authMiddleware() : void {
    if(this.enableAthorization) {
      // this.authorizationProvider.test(...arguments);
    } else {
      arguments[2]();
    }
    // arguments[2]();
  }


  public useAuthorizationProvider<T>(provider: Type<T>) {
    this.enableAthorization = true;
    this._injector.set('services', provider);
    this.authorizationProvider = this._injector.resolve<any>(provider.name);
  }

  public async useDBProvider<T>(provider: Type<T>) {
    this._injector.set('services', provider);
    this.dbProvider = this._injector.resolve<any>(provider.name);
  }

  private defineRoute(method, target, path, fname, descriptor) : void {
    // console.log('difine route', method, path, target.name)
    
    const controller = Application._instance.routes[target.constructor.name] ?
                       Application._instance.routes[target.constructor.name] : 
                       Application._instance.routes[target.constructor.name] = {};


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

          Application._instance.app.use(`/${basePath}`, Application._instance.authMiddleware.bind(Application._instance), Router()[method](`/${route}`, handler))
        })

      });
    }
  }

  public static Authorization (target) : void {
    console.log(target.name, 'need authorization')
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
}

export default Application;