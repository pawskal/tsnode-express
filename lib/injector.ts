import 'reflect-metadata'
import { UserController } from '../example/modules/user.controller';

interface IController {
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

interface Type<T> {
  new(...args: any[]): T;
}

export class Injector  {
  public static getInstance(): Injector {
    return new Injector();
  }

  private injections: Map<string, Type<any>> = new Map<string, Type<any>>();

  public controllers: Map<string, IController> = new Map<string, IController>()

  private static _instance: Injector;

  private constructor() {
    return Injector._instance || (Injector._instance = this);
  }

  resolve<T>(targetName: string): T {
    const target = this.injections.get(targetName);
    const tokens = Reflect.getMetadata('design:paramtypes', target) || [];
    const instances = tokens.map(t => this.resolve<any>(t.name)) || [];
    return new target(...instances);
  }

  public set(target: Type<any>): void {
    this.injections.set(target.name, target);
  }

  public static Controller(basePath) : Function {
    return (target) : void => {
      const controller: IController = Injector._instance.controllers.get(target.name)
      console.log(Injector._instance.controllers)
      Object.assign(controller, { basePath })
      Injector._instance.set(target);
    }
  }

  public static Authorization (target) : void {
    console.log(target.name, 'need authorization')
  }

  public static Service (target) : void {
    Injector._instance.set(target);
  }

  private defineRoute(method: string, type: string, target: Type<any>, path: string, fname: string, descriptor: PropertyDescriptor) : void {
    if(!this.controllers.has(target.constructor.name)) {
      this.controllers.set(target.constructor.name, {
        routes: new Map<string, IRoutes>()
      })
    }
    const controller: IController = this.controllers.get(target.constructor.name)
    controller.routes.set(path, { 
      [method]: {
        [type] : {
          name: fname,
          handler: descriptor.value as Function
        }
      }
    });
  }

  public static Get = (path: string) : Function =>
    (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => {
      Injector._instance.defineRoute('get', 'origin', target, path, fname, descriptor);
  }

  public static Post = (path: string) : Function =>
    (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
      Injector._instance.defineRoute('post', 'origin', target, path, fname, descriptor);
  

  public static Put = (path: string) : Function =>
    (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
      Injector._instance.defineRoute('patch', 'origin', target, path, fname, descriptor);
  

  public static Patch = (path: string) : Function =>
    (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
      Injector._instance.defineRoute('patch', 'origin', target, path, fname, descriptor);
  

  public static Delete = (path: string) : Function =>
    (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
      Injector._instance.defineRoute('delete', 'origin', target, path, fname, descriptor);
  
}
