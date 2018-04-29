import 'reflect-metadata'
import { Type, IController, IRoutes, IAuthOption } from './interfaces';
import { Controller, Service, Authorization, Get, Post, Patch, Put, Delete, Before, After } from './decorators'

export default class Injector {
  public static getInstance(): Injector {
    return new Injector();
  }

  private static _instance: Injector;
  
  public static Controller: Function = Controller.bind(Injector.getInstance());

  public static Service: Function = Service.bind(Injector.getInstance());

  public static Authorization: Function = Authorization.bind(Injector.getInstance());

  public static Get: Function = Get.bind(Injector.getInstance());

  public static Post: Function = Post.bind(Injector.getInstance());

  public static Put: Function = Put.bind(Injector.getInstance());

  public static Patch: Function = Patch.bind(Injector.getInstance()); 

  public static Delete: Function = Delete.bind(Injector.getInstance());

  public static Before: Function = Before.bind(Injector.getInstance());

  public static After: Function = After.bind(Injector.getInstance());

  private injections: Map<string, Type<any>> = new Map<string, Type<any>>();

  private instances: Map<string, any> = new Map<string, any>();

  public controllers: Map<string, IController> = new Map<string, IController>();

  private constructor() {
    return Injector._instance || (Injector._instance = this);
  }

  public resolve<T>(targetName: string): T {
    if(this.instances.has(targetName)){
      return this.instances.get(targetName);
    }
    const target: Type<T> = this.injections.get(targetName);
    const tokens: Array<FunctionConstructor> = Reflect.getMetadata('design:paramtypes', target) || [];
    const instances: Array<T> = tokens.map(t => this.resolve<any>(t.name)) || [];
    this.instances.set(targetName, new target(...instances))
    return this.instances.get(targetName);
  }

  public setInstance(target: any): void {
    this.instances.set(target.constructor.name, target);
  }

  public set(target: Type<any>): void {
    this.injections.set(target.name, target);
  }

  private defineRoute(method: string, type: string, target: Type<any>,
                      defaultPath: string, fname: string, descriptor: PropertyDescriptor, authOption?: IAuthOption) : void {
    if(!this.controllers.has(target.constructor.name)) {
      this.controllers.set(target.constructor.name, {
        routes: new Map<string, IRoutes>()
      });
    }

    const path = this.normalizePath(defaultPath);

    const controller: IController = this.controllers.get(target.constructor.name)
    const route: IRoutes = controller.routes.get(path) || {};
    
    let methodDefinition = route[method] || {};
    Object.assign(methodDefinition, {
      auth: authOption && authOption.auth,
      role: authOption && authOption.role,
      [type] : {
        name: fname,
        handler: descriptor.value as Function
      }
    });
    route[method] = methodDefinition;
    controller.routes.set(path, route);
  }

  public normalizePath(defaultPath: string): string {
    if(defaultPath.endsWith('/') && !defaultPath.startsWith('/')){
      return `/${defaultPath}`.slice(0, -1);
    } else if(defaultPath.endsWith('/')) {
      return defaultPath.slice(0, -1);
    } else if(!defaultPath.startsWith('/')){
      return `/${defaultPath}`;
    } else {
      return defaultPath;
    }
  }
}
