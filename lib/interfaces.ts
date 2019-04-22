import { Request, Response } from 'express';
import {RedisClient} from "redis";
import { success, warning, error, info } from 'nodejs-lite-logger';

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

export interface IController extends IAuthOption {
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

export interface Type<T> {
  new(...args: any[]): T;
}

export interface IRequestArguments {
  body?: any;
  params?: any;
  query?: any;
  auth?: any;
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

export abstract class ITransportProvider {
  abstract publish(path: string, args: IRequestArguments): void;
  abstract subscribe(channelName: string): void;
  abstract on(eventName: string, cb: Function): void;
}

export abstract class IRedisTransportProvider extends ITransportProvider {
  protected redisClient: RedisClient;
  protected channel: string;

  on(eventName: string, cb: any){
    info(`${eventName}`)
    this.redisClient.on(`message`, (data) => console.log('DATA', data));

  }

  private eventHandler(eventName: string, data: string, cb: any){
    console.log(eventName, data, '@@@@@@@@@@@@@@@@@@@')
  }

}

export interface ITransportEvent extends IRequestArguments {
  requestChannel: string,
  requestId: string,
}
  