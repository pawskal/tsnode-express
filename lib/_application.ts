import Injector from './_injector';
import {
    Type,
} from './interfaces';
import {  ConfigProvider } from './helpers';

class TSNodeCore {
  public get Injector(): Injector {
    return this._injector;
  }

  protected exportValues: Array<string> = ['configProvider'];

  protected static _instance: TSNodeCore;

  protected _injector: Injector;

  protected configProvider: ConfigProvider;

  protected pendingInjections: Map<string, Promise<any>> = new Map<string, Promise<any>>()

  protected autoInjections: string[] = [];

  protected plugins: string[] = [];

  constructor() {
    this._injector = Injector.getInstance();

    this._injector.setInstance(this);

    this.configProvider = new ConfigProvider({});
    return TSNodeCore._instance || (TSNodeCore._instance = this);
  }

  public registerModule(): TSNodeCore {
    return this;
  }

  public autoResolve<T>(target: Type<T>): TSNodeCore {
    this.autoInjections.push(target.name);
    this._injector.set(target);
    return this;
  }

  public usePlugin(plugin: any): TSNodeCore {
    this.plugins.push(plugin.name);
    this._injector.set(plugin);
    return this;
  }

  public inject<T>(name: string, cb: Function): TSNodeCore;
  public inject<T>(instance: T): TSNodeCore;
  public inject(): TSNodeCore {
    arguments.length == 1 && this._injector.setInstance(arguments[0]);
    arguments.length == 2 && this.pendingInjections.set(arguments[0], arguments[1] ? arguments[1](this.configProvider) : Promise.resolve());
    return this;
  }

  public set exportValue(value: string) {
    this.exportValues = [value, ...this.exportValues];
  }

  public async start(cb?: Function) : Promise<void> {

    await this.pendingInjections.get('ConfigProvider')
    this._injector.setInstance(this.configProvider);

    await Promise.all([...this.pendingInjections.entries()]
      .filter(([key]) => key !== 'ConfigProvider')
      .map(async ([key, injectionPromise]) => {
        const injection: Type<any> = await injectionPromise;
        return this._injector.setInstance(key, injection)
      }));

    this.autoInjections.forEach((inj: string)=> this._injector._resolveTarget(inj));

    this.plugins.forEach((inj: string)=> {
        this._injector._resolveTarget(inj);
        if(!this._injector.getPlugin(inj)){
            this._injector.plugins.set(inj, {});
        }
    });
    cb && cb(...this.exportValues.map((value) => this[value]));
  }
}

export default TSNodeCore;
