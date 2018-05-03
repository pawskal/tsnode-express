import { IController, IAuthOption, Type, IAuthRole } from './interfaces';

export function Authorization (auth?: IAuthRole) : Function {
  return (target: Type<any>) : void => {
    const controller: IController = this.controllers.get('UserController');
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

export function Service (target: Type<any>) : void {
  console.log(target)
  this.set(target);
}

export function Get(path: string, authOption?: IAuthOption) : Function {
  return (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
    this.defineRoute('get', 'origin', target, path, fname, descriptor, authOption);
}

export function Post (path: string, authOption?: IAuthOption) : Function {
  return (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
    this.defineRoute('post', 'origin', target, path, fname, descriptor, authOption);
}


export function Put (path: string, authOption?: IAuthOption) : Function {
  return (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
    this.defineRoute('patch', 'origin', target, path, fname, descriptor, authOption);}


export function Patch (path: string, authOption?: IAuthOption) : Function {
  return (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
    this.defineRoute('patch', 'origin', target, path, fname, descriptor, authOption);
}


export function Delete (path: string, authOption?: IAuthOption) : Function {
  return (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
    this.defineRoute('delete', 'origin', target, path, fname, descriptor, authOption);
}

export function Before(path: string, method: string) : Function {
  return (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
    this.defineRoute(method.toLowerCase(), 'before', target, path, fname, descriptor);
}

export function After(path: string, method: string) : Function {
  return (target: Type<any>, fname: string, descriptor: PropertyDescriptor) : void => 
    this.defineRoute(method.toLowerCase(), 'after', target, path, fname, descriptor);
}
