import { IController, IAuthOption, Type, IAuthRole } from './interfaces';

export function Authorization (auth?: IAuthRole) : Function {
  return (target: Type<any>) : void => {
    const controller: IController = this.controllers.get(target.name);
    Object.assign(controller, { auth: true, role: auth && auth.role || 'default' });
  }
}

export function Controller (basePath: string) : Function {
  return (target) : void => {
    const controller: IController = this.controllers.get(target.name);
    Object.assign(controller, { basePath: this.normalizePath(basePath) });
    this.set(target);
  }
}

export function Service () : Function {
  return (target: Type<any>) : void => {
    console.log(target)
    this.set(target);
  }
} 

export function RouteDecorator(type: string, method: string, path: string, authOption?: IAuthOption) : Function {
  console.log(arguments)

  return (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
    this.defineRoute(method.toLowerCase(), type, target, path, fname, descriptor, authOption);
}
