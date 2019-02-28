import Injector from './injector';
import { IController, Type, IAuthProvider, IResponse, IProviderDefinition, IRequest } from './interfaces';
import { AuthOptions, ConfigProvider } from './helpers';
declare class Application {
    readonly Injector: Injector;
    protected static _instance: Application;
    protected _injector: Injector;
    express: any;
    protected router: any;
    protected authorizationProvider: IProviderDefinition<IAuthProvider>;
    protected enableAthorization: boolean;
    protected authorizationOptions: AuthOptions;
    protected configProvider: ConfigProvider;
    protected controllers: Map<string, IController>;
    protected logLevels: string[];
    constructor(cb?: Function);
    registerModule(...args: any[]): void;
    protected authMiddleware(req: IRequest, res: IResponse, next: Function): void;
    setLogLevels(cb: any): void;
    useAuthorizationProvider<T>(provider: Type<T>, cb?: Function): void;
    useConfig(cb: Function): void;
    protected health(): void;
    protected handleNotFound(): void;
    protected buildController(definition: IController, name: string): void;
    start(cb: Function): void;
}
export default Application;
