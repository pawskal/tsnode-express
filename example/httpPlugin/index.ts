import './decorators';
import TSNodeExpress from './plugin';
// const PLUGIN_NAME = TSNodeExpress.name;
const PLUGIN_NAME = 'TSNodeExpress.name';

import {
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
  IAuthOptions,
  IAuthTarget,
  IRequest,
  IResponse,
  IRequestArguments,
  HttpMethods
} from './interfaces';

export type IAuthProvider = IAuthProvider;
export type IAuthOptions = IAuthOptions;
export type IAuthTarget = IAuthTarget;
export type IRequest = IRequest;
export type IResponse = IResponse;
export type IRequestArguments = IRequestArguments;

export {
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
};


export { TSNodeExpress, PLUGIN_NAME };