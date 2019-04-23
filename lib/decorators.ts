import Injector from './injector'

const { 
  ControllerDecorator,
  AuthorizationDecorator,
  ServicDecorator,
  RouteDecorator,
  TransportDecorator,
} = Injector.getInstance();

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

export const Transport: Function = TransportDecorator.bind(Injector.getInstance());
