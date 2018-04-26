export interface IAuthMiddlewate {
  verify(data: any): IVerifyResponse;
}
export interface IVerifyResponse{
  verify : boolean,
  data?: any
}

export interface IAuthOption {
  auth?: boolean;
}

export interface IController extends IAuthOption {
  instance?: any;
  basePath?: string;
  routes?: Map<string, IRoutes>;
}

export interface IMethod {
  name?: string
  handler?: Function
}

export interface IMethodSet extends IAuthOption {
  origin?: IMethod
}

export interface IRoutes {
  get?: IMethodSet;
  post?: IMethodSet;
  put?: IMethodSet;
  patch?: IMethodSet;
  delete?: IMethodSet;
}



export interface Type<T> {
  new(...args: any[]): T;
}
  
  