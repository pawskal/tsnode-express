import { Request, Response } from 'express';

export interface IProviderDefinition {
  name: string;
  instance?: any;
}

export interface Response extends Response {
  result?: any;
}

export interface Request extends Request {
  auth?: any;
}

export interface IAuthMiddleware {
  verify(data: any): IVerifyResponse;
}

export interface IAuthOptions {
  authorizationHeader?: string;
  authorizationQueryParam?: string;
  strategy?: string;
  secret?: string;
}

export interface IVerifyResponse{
  success : boolean,
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

export interface IRequestArguments {
  body?: any;
  params?: any;
  query?: any;
  auth?: any;
}
  