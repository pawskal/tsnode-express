import Injector from './_injector'

const { 
  InjectableDecorator,
} = Injector.getInstance();

export const Injectable: Function = InjectableDecorator.bind(Injector.getInstance());
