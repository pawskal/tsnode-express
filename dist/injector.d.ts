import 'reflect-metadata';
import { Type, IController, IAuthOption, IAuthRole } from './interfaces';
export default class Injector {
    static getInstance(): Injector;
    private static _instance;
    private injections;
    private instances;
    controllers: Map<string, IController>;
    private constructor();
    resolve<T>(targetName: string): T;
    setInstance(target: any): void;
    set(target: Type<any>): void;
    AuthorizationDecorator(auth?: IAuthRole): Function;
    ControllerDecorator(basePath: string): Function;
    ServicDecorator(): Function;
    RouteDecorator(type: string, method: string, path: string, authOption?: IAuthOption): Function;
    private defineRoute;
    normalizePath(defaultPath: string): string;
}
