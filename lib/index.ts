import Application from './application';
import Injector from './injector';

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
  After
} from './decorators';

import {
  IProviderDefinition,
  IAuthMiddleware,
  IAuthOptions,
  IAuthTarget,
  IRequest,
  IResponse,
  IRequestArguments,
  IVerifyResponse
} from './interfaces';

import { ConfigProvider } from './helpers'

export type IAuthMiddleware = IAuthMiddleware;
export type IAuthOptions = IAuthOptions;
export type IAuthTarget = IAuthTarget;
export type IRequest = IRequest;
export type IResponse = IResponse;
export type IRequestArguments = IRequestArguments;
export type IVerifyResponse = IVerifyResponse;

export {
  Application,
  ConfigProvider,
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
};
