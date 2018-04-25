import 'reflect-metadata'
import Application from './application';

interface Type<T> {
  new(...args: any[]): T;
}

export class Injector  {
  private services: Map<string, Type<any>> = new Map<string, Type<any>>();

  private express: any;
  
  constructor(private app: Application) {
    this.express = app.app;
  }

  resolve<T>(targetName: string): T {
    // console.log(this.services)
    const target = this.services.get(targetName);
    console.log(target)
    const tokens = Reflect.getMetadata('design:paramtypes', target) || [];
    // console.log(tokens)
    const instances = tokens.map(t => this.resolve<any>(t.name)) || [];
    // console.log(instances)
    return new target(...instances);
  }

  public set(type, target: Type<any>): void {
    this.services.set(target.name, target);
  }
}
