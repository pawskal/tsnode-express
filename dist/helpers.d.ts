import { IAuthOptions, IRequest, IRequestArguments, IAuthTarget } from "./interfaces";
export declare class AuthOptions implements IAuthOptions {
    authorizationHeader: string;
    authorizationQueryParam: string;
    authorizationBodyField: string;
    constructor();
}
export declare class ConfigProvider {
    [x: string]: any;
    constructor(config: any);
}
export declare class RequestArguments implements IRequestArguments {
    body: any;
    auth: any;
    params: any;
    query: any;
    constructor({ body, params, query, auth }: IRequest);
}
export declare class AuthTarget implements IAuthTarget {
    controller: string;
    method: string;
    basePath: string;
    path: string;
    functionName: string;
    role: string;
    roles: Array<string>;
    fullPath: string;
    constructor({ basePath, path }: IAuthTarget);
}
