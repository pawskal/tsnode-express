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
} from './decorators';

import {
  IAuthProvider,
  IPlugin,
  IAuthOptions,
  IAuthTarget,
  IRequest,
  IResponse,
  IRequestArguments,
  HttpMethods
} from './interfaces';

import Injector from './injector';

export type IAuthProvider = IAuthProvider;
export type IAuthOptions = IAuthOptions;
export type IAuthTarget = IAuthTarget;
export type IRequest = IRequest;
export type IResponse = IResponse;
export type IRequestArguments = IRequestArguments;

export {
  Application,
  ConfigProvider,
  IPlugin,
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
  HttpMethods,
  Injector
};
