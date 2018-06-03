import { IAuthMiddleware, IAuthOptions, IRequest, IResponse, IRequestArguments, IAuthTarget } from "./interfaces";

export class AuthOptions implements IAuthOptions {
  public strategy: string = 'jwt';
  public authorizationHeader: string = 'authorization';
  public authorizationQueryParam: string = 'access_token'
  public authorizationBodyField: string = 'accessToken';
  constructor() {}
}

export class ConfigProvider {
  [x: string]: any;
  constructor(config: any) {
    Object.assign(this, config)
  }
}

export class RequestArguments implements IRequestArguments {
  public body: any;
  public auth: any;
  public params: any;
  public query: any;
  constructor({ body, params, query, auth } : IRequest) {
    this.body = body;
    this.params = params;
    this.auth = auth;
    this.query = query;
  }
}

export class AuthTarget implements IAuthTarget {
  public controller: string;
  public method: string;
  public basePath: string;
  public path: string;
  public functionName: string;
  public role: string;
  public roles: Array<string>;
  public fullPath: string;
  constructor({ controller, method, basePath, path, functionName, roles } : IAuthTarget) {
    Object.assign(this, arguments[0]);
    this.fullPath = `${basePath}${path}`
  }
}
