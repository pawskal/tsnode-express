import { IAuthMiddleware, IAuthOptions, Request, Response, IRequestArguments } from "./interfaces";

export class AuthOptions implements IAuthOptions {
  public strategy: string = 'jwt';
  public authorizationHeader: string = 'Authorization';
  public authorizationQueryParam: string = 'access_token';
  constructor() {}
}

export class ConfigProvider {
  constructor(public config) {
    Object.assign(this.config, config);
  }
}

export class RequestArguments implements IRequestArguments {
  public body: any;
  public auth: any;
  public params: any;
  public query: any;
  constructor({ body, params, query, auth } : Request) {
    this.body = body;
    this.params = params;
    this.auth = auth;
    this.query = query;
  }
}
