import { IAuthProvider, IAuthOptions, IRequest, IResponse, IController } from './interfaces';
export declare class AuthMiddleware {
    constructor(req: IRequest, res: IResponse, next: Function, authProvider: IAuthProvider, authOptions: IAuthOptions, controllers: Map<string, IController>);
}
