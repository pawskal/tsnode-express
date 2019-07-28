import { IAuthRole, IAuthOption, IRoutes, IControllerDefinition } from "./interfaces";

import { Type } from "../../lib/interfaces";

class HttpMeta {
  private static instance: HttpMeta;
  constructor() {
    return HttpMeta.instance || (HttpMeta.instance = this);
  }
  public controllers: Map<string, IControllerDefinition> = new Map<string, IControllerDefinition>();

  public AuthorizationDecorator (auth?: IAuthRole) : Function {
    return (target: Type<any>) : void => {
      const controller: IControllerDefinition = this.controllers.get(target.name);
      Object.assign(controller, { 
        auth: true,
        roles: auth && auth.roles,
        role: auth && auth.role
    });
    }
  }

  public ControllerDecorator (basePath: string) : Function {
    return (target) : void => {
      const controller: IControllerDefinition = this.controllers.get(target.name);
      Object.assign(controller, { basePath: this.normalizePath(basePath) });
    }
  }

  public RouteDecorator(type: string, method: string, path: string, authOption?: IAuthOption) : Function {
    return (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
      this.defineRoute(method.toLowerCase(), type, target, path, fname, descriptor, authOption);
  }

  public defineRoute(method: string, type: string, target: Type<any>,
                      defaultPath: string, fname: string, descriptor: PropertyDescriptor, authOption?: IAuthOption) : void {
    if(!this.controllers.has(target.constructor.name)) {
      this.controllers.set(target.constructor.name, {
        routes: new Map<string, IRoutes>()
      });
    }

    const path = this.normalizePath(defaultPath);

    const controller: IControllerDefinition = this.controllers.get(target.constructor.name)
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

export const httpMeta = new HttpMeta()

export const Controller: Function = httpMeta.ControllerDecorator.bind(httpMeta);

export const Authorization: Function = httpMeta.AuthorizationDecorator.bind(httpMeta);

export const Get: Function = httpMeta.RouteDecorator.bind(httpMeta,'origin', 'get');

export const Post: Function = httpMeta.RouteDecorator.bind(httpMeta, 'origin', 'post',);

export const Put: Function = httpMeta.RouteDecorator.bind(httpMeta,'origin', 'put');

export const Patch: Function = httpMeta.RouteDecorator.bind(httpMeta, 'origin', 'patch'); 

export const Delete: Function = httpMeta.RouteDecorator.bind(httpMeta, 'origin', 'delete');

export const Before: Function = httpMeta.RouteDecorator.bind(httpMeta, 'before');

export const After: Function = httpMeta.RouteDecorator.bind(httpMeta, 'after');


