import { Request, Response } from 'express';

export interface IController {
  req?: Request;
  res?: Response;
  next: Function;
}

export interface IProviderDefinition<T> {
  name: string;
  instance?: T;
}

export interface IResponse extends Response {
  result?: any;
}

export interface IRequest extends Request {
  auth?: any;
}

export interface IAuthProvider {
  verify<T>(token: string, authTarget: IAuthTarget): Promise<T>;
}

export interface IAuthOptions {
  authorizationHeader?: string;
  authorizationQueryParam?: string;
  authorizationBodyField?: string;
}

export interface IAuthOption extends IAuthRole {
  auth?: boolean;
}

export interface IControllerDefinition extends IAuthOption {
  instance?: any;
  basePath?: string;
  routes?: Map<string, IRoutes>;
}

export interface IMethod {
  name?: string;
  handler?: Function;
}

export interface IMethodSet extends IAuthOption {
  origin?: IMethod;
  before?: IMethod;
  after?: IMethod;
}

export interface IRoutes {
  get?: IMethodSet;
  post?: IMethodSet;
  put?: IMethodSet;
  patch?: IMethodSet;
  delete?: IMethodSet;
}

export interface IRequestArguments {
  body?: any;
  params?: any;
  query?: any;
  auth?: any;
  headers?: IRequestHeaders
}

export interface IAuthRole {
  role?: string;
  roles?: Array<string>;
}

export interface IAuthTarget extends IAuthRole {
  controller: string;
  method: string;
  basePath: string;
  path: string;
  functionName: string;
  fullPath?: string; 
}

export interface IRequestHeaders {
    [key: string]: string
}

export enum HttpMethods {
 GET = 'GET',
 HEAD = 'HEAD',
 POST = 'POST',
 PUT = 'PUT',
 DELETE = 'DELETE',
 PATCH = 'PATCH',
 OPTIONS = 'OPTIONS'
}
