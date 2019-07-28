import 'reflect-metadata'
import { Type } from './interfaces';
import { ResolveTypes } from './interfaces';
import { NotFoundError, InternalServerError, ExtendedError, UnauthorizedError } from 'ts-http-errors';
import { success, warning, error, info } from 'nodejs-lite-logger';

const _global = global as any;

interface IInjection {
  injection: Type<any>;
  resolveType: ResolveTypes;
}

export default class Injector {
  public static getInstance(): Injector {
    return new Injector();
  }

  private static _instance: Injector;
  
  private injections: Map<string, IInjection> = new Map<string, IInjection>();

  private instances: Map<string, any> = new Map<string, any>();

  public plugins: Map<string, any> = new Map<string, any>();

  private constructor() {
    return Injector._instance || (_global._injector = Injector._instance = this);
  }

  private _resolve<T>(injection: Type<T>) {
    console.log(injection)
    const tokens: Array<FunctionConstructor> = Reflect.getMetadata('design:paramtypes', injection) || [];
    const instances: Array<T> = tokens.map(t => this._resolveTarget<any>(t.name)) || [];
    return new injection(...instances)
  }

  public _resolveTarget<T>(targetName: string): T {
    try {
      const { injection, resolveType }: IInjection = this.injections.has(targetName)
        && this.injections.get(targetName)
        || { resolveType: ResolveTypes.SINGLETON } as IInjection;

      if (resolveType === ResolveTypes.SINGLETON) {
        if(this.instances.has(targetName)){
          return this.instances.get(targetName);
        }
        return this.instances
          .set(targetName, this._resolve(injection))
          .get(targetName);
      }
      return this._resolve(injection)
    } catch (e) {
      error(e)
      throw new InternalServerError(`Unable to resolve injection ${targetName}`)
    }
  }

  public setInstance(name: string, target: any): void;
  public setInstance(target: any): void;
  public setInstance(): void {
    arguments.length == 2 && this.instances.set(arguments[0], arguments[1]);
    arguments.length == 1 && this.instances.set(arguments[0].constructor.name, arguments[0]);
  }

  public set(target: Type<any>, resolveType: ResolveTypes = ResolveTypes.SINGLETON): void {
    this.injections.set(target.name, {
      injection: target,
      resolveType,
    });
  }

  public getPlugin(name: string): any {
      return this.plugins.get(name);
  }

  public InjectableDecorator (resolveType: ResolveTypes = ResolveTypes.SINGLETON) : Function {
    return (target: Type<any>) : void => {
      this.set(target, resolveType);
    }
  } 
}
