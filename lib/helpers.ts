import { IAuthOptions, IRequest, IRequestArguments, IAuthTarget, IController, IRoutes } from "./interfaces";

export class AuthOptions implements IAuthOptions {
  public authorizationHeader: string = 'authorization';
  public authorizationQueryParam: string = 'access_token'
  public authorizationBodyField: string = 'accessToken';
  constructor() {}
}

export class ConfigProvider {
  [x: string]: any;
  constructor(config: any) {
    Object.assign(this, { logLevels: [], printStack: false }, config)
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
  constructor(req: IRequest, controllers: Map<string, IController>) {
    controllers.forEach((controller: IController, name: string) => {
      if(controller.basePath == req.baseUrl) {
        this.controller = name;
        this.basePath = controller.basePath;
        this.role = controller.role;
        this.roles = [...[this.role],
                 ...controller.roles || []]
      }
    });

    const controller: IController = controllers.get(this.controller)

    controller.routes.forEach((route: IRoutes, path: string) => {
        if(path == req.route.path) {
            this.path = path;
            this.method = Object.keys(route).find((method) => method == req.route.stack[0].method)
        }
    })

    const methodDefinition = controller.routes.get(this.path)

    this.functionName = methodDefinition[this.method].origin && methodDefinition[this.method].origin.name ||
                        methodDefinition[this.method].before && methodDefinition[this.method].before.name ||
                        methodDefinition[this.method].after && methodDefinition[this.method].after.name;
    this.role = methodDefinition[this.method].role || this.role;
    this.roles = [...[methodDefinition[this.method].role],
                  ...methodDefinition[this.method].roles || [],
                  ...this.roles].filter((role) => role)
                            .filter((role, i, roles) => roles.indexOf(role) == i);
  }

  get fullPath() {
    return `${this.basePath}${this.path}`
  }
}
