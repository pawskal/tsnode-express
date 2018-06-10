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
  After
} from './decorators';

import {
  IAuthProvider,
  IAuthOptions,
  IAuthTarget,
  IRequest,
  IResponse,
  IRequestArguments,
  IVerifyResponse
} from './interfaces';

export type IAuthProvider = IAuthProvider;
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
