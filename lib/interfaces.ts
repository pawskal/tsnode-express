import Application from "./_application";

export interface Type<T> {
  new(...args: any[]): T;
}

export interface IPlugin {
  application: Application;
}
  
export enum ResolveTypes {
  SINGLETON,
  SCOPED,
}