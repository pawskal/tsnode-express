import Injector from './injector'

const injector = Injector.getInstance();

const { 
  ControllerDecorator,
  AuthorizationDecorator,
  ServicDecorator,
  RouteDecorator
} = injector

export const Controller: Function = ControllerDecorator.bind(Injector.getInstance());

export const Service: Function = ServicDecorator.bind(Injector.getInstance());

export const Authorization: Function = AuthorizationDecorator.bind(Injector.getInstance());

export const Get: Function = RouteDecorator.bind(Injector.getInstance(),'origin', 'get');

export const Post: Function = RouteDecorator.bind(Injector.getInstance(), 'origin', 'post',);

export const Put: Function = RouteDecorator.bind(Injector.getInstance(),'origin', 'put');

export const Patch: Function = RouteDecorator.bind(Injector.getInstance(), 'origin', 'patch'); 

export const Delete: Function = RouteDecorator.bind(Injector.getInstance(), 'origin', 'delete');

export const Before: Function = RouteDecorator.bind(Injector.getInstance(), 'before');

export const After: Function = RouteDecorator.bind(Injector.getInstance(), 'after');
