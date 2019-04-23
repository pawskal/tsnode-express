import Application from './application';
import { ConfigProvider } from './helpers'

import {
  Service,
  Controller,
  Authorization,
  Get, 
  Post, 
  Put, 
  Patch, 
  Delete,
  Before,
  After,
  Transport
} from './decorators';

import {
  IAuthProvider,
  ITransportProvider,
  IRedisTransportProvider,
  IAuthOptions,
  IAuthTarget,
  IRequest,
  IResponse,
  IRequestArguments,
} from './interfaces';

export type IAuthProvider = IAuthProvider;
export type IAuthOptions = IAuthOptions;
export type IAuthTarget = IAuthTarget;
export type IRequest = IRequest;
export type IResponse = IResponse;
export type IRequestArguments = IRequestArguments;

export {
  Application,
  ConfigProvider,
  ITransportProvider,
  IRedisTransportProvider,
  Service,
  Controller,
  Authorization,
  Get, 
  Post, 
  Put, 
  Patch, 
  Delete,
  Before,
  After,
  Transport
};
