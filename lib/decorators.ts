import { IController, IAuthOption, Type } from './interfaces';

export function Authorization (target: Type<any>) : void {
  const controler: IController = this.controllers.get('UserController')
  controler.auth = true
}

export function Controller (basePath: string) : Function {
  return (target) : void => {
    const controller: IController = this.controllers.get(target.name)
    console.log(this.controllers)
    Object.assign(controller, { basePath })
    this.set(target);
  }
}

export function Service (target: Type<any>) : void {
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
