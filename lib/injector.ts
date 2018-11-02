import 'reflect-metadata'
import { Type, IController, IRoutes, IAuthOption, IAuthRole } from './interfaces';

export default class Injector {
  public static getInstance(): Injector {
    return new Injector();
  }

  private static _instance: Injector;
  
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

  public AuthorizationDecorator (auth?: IAuthRole) : Function {
    return (target: Type<any>) : void => {
      const controller: IController = this.controllers.get(target.name);
      Object.assign(controller, { 
        auth: true,
        roles: auth && auth.roles,
        role: auth && auth.role
     });
    }
  }
  
  public ControllerDecorator (basePath: string) : Function {
    return (target) : void => {
      const controller: IController = this.controllers.get(target.name);
      Object.assign(controller, { basePath: this.normalizePath(basePath) });
      this.set(target);
    }
  }
  
  public ServicDecorator () : Function {
    return (target: Type<any>) : void => {
      this.set(target);
    }
  } 
  
  public RouteDecorator(type: string, method: string, path: string, authOption?: IAuthOption) : Function {
    return (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
      this.defineRoute(method.toLowerCase(), type, target, path, fname, descriptor, authOption);
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
    
    const methodDefinition = route[method] || {};
    Object.assign(methodDefinition, {
      auth: authOption && authOption.auth,
      role: authOption && authOption.role,
      roles: authOption && authOption.roles,
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
