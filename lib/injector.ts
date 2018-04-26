import 'reflect-metadata'
import { UserController } from '../example/modules/user.controller';
import { Type, IController, IRoutes, IAuthOption } from './interfaces';

export class Injector  {
  public static getInstance(): Injector {
    return new Injector();
  }

  private injections: Map<string, Type<any>> = new Map<string, Type<any>>();

  public controllers: Map<string, IController> = new Map<string, IController>();

  private instances: Map<string, any> = new Map<string, any>();;

  private static _instance: Injector;

  private constructor() {
    return Injector._instance || (Injector._instance = this);
  }

  resolve<T>(targetName: string): T {
    if(this.instances.has(targetName)){
      return this.instances.get(targetName);
    }
    const target = this.injections.get(targetName);
    const tokens = Reflect.getMetadata('design:paramtypes', target) || [];
    const instances = tokens.map(t => this.resolve<any>(t.name)) || [];
    this.instances.set(targetName, new target(...instances))
    return this.instances.get(targetName);
  }

  public setInstance(target: any): void {
    this.instances.set(target.constructor.name, target);
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
    const controler: IController = Injector._instance.controllers.get('UserController')
    controler.auth = true
    console.log(Injector._instance.controllers.get('UserController'), 'need authorization')
  }

  public static Service (target) : void {
    Injector._instance.set(target);
  }

  private defineRoute(method: string, type: string, target: Type<any>,
                      path: string, fname: string, descriptor: PropertyDescriptor, authOption?: IAuthOption) : void {
    if(!this.controllers.has(target.constructor.name)) {
      this.controllers.set(target.constructor.name, {
        routes: new Map<string, IRoutes>()
      })
    }
    const controller: IController = this.controllers.get(target.constructor.name)
    const route = controller.routes.get(path) || {}
    controller.routes.set(path, Object.assign(route, { 
      [method]: {
        auth: authOption && authOption.auth,
        [type] : {
          name: fname,
          handler: descriptor.value as Function
        }
      }
    }));
  }

  public static Get = (path: string, authOption?: IAuthOption) : Function =>
    (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => {
      Injector._instance.defineRoute('get', 'origin', target, path, fname, descriptor, authOption);
  }

  public static Post = (path: string, authOption?: IAuthOption) : Function =>
    (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
      Injector._instance.defineRoute('post', 'origin', target, path, fname, descriptor, authOption);
  

  public static Put = (path: string, authOption?: IAuthOption) : Function =>
    (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
      Injector._instance.defineRoute('patch', 'origin', target, path, fname, descriptor, authOption);
  

  public static Patch = (path: string, authOption?: IAuthOption) : Function =>
    (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
      Injector._instance.defineRoute('patch', 'origin', target, path, fname, descriptor, authOption);
  

  public static Delete = (path: string, authOption?: IAuthOption) : Function =>
    (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
      Injector._instance.defineRoute('delete', 'origin', target, path, fname, descriptor, authOption);
}
