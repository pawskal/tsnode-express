import { 
  IAuthProvider,
  IAuthOptions,
  IRequest,
  IResponse, 
  IController, 
  IRoutes
} from './interfaces';

import { AuthTarget } from './helpers';

export class AuthMiddleware {
  constructor(req: IRequest, res: IResponse, next: Function, authProvider: IAuthProvider,
              authOptions: IAuthOptions, controllers: Map<string, IController>) {

    let controllerName: string;
    let controllerBasePath: string;
    let routePath: string;
    let methodName: string;
    let role;
    let roles = [];

    controllers.forEach((controller: IController, name: string) => {
      if(controller.basePath == req.baseUrl) {
        controllerName = name;
        controllerBasePath = controller.basePath;
        role = controller.role;
        roles = [...[role],
                 ...controller.roles || []]
      }
    });

    const controller: IController = controllers.get(controllerName)

    controller.routes.forEach((route: IRoutes, path: string) => {
        if(path == req.route.path) {
            routePath = path;
            methodName = Object.keys(route).find((method) => method == req.route.stack[0].method)
        }
    })

    const methodDefinition = controller.routes.get(routePath)

    const authTarget = new AuthTarget({
      controller: controllerName,
      method: methodName,
      basePath: controllerBasePath,
      path: routePath,
      functionName: methodDefinition[methodName].origin && methodDefinition[methodName].origin.name ||
                    methodDefinition[methodName].before && methodDefinition[methodName].before.name ||
                    methodDefinition[methodName].after && methodDefinition[methodName].after.name,
      role:  methodDefinition[methodName].role || role,
      roles: [...[methodDefinition[methodName].role],
              ...methodDefinition[methodName].roles || [],
              ...roles].filter((role) => role)
                       .filter((role, i, roles) => roles.indexOf(role) == i),
    });

    const token = req.headers[authOptions.authorizationHeader.toLowerCase()] ||
                  req.query[authOptions.authorizationQueryParam] ||
                  req.body[authOptions.authorizationBodyField];
    if(!token) {
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized',
        name: 'AuthorizationError'
      });
    }

    try {
      req.auth = authProvider.verify(token, authTarget);
      next();
    } catch (e) {
      res.status(e.statusCode || 403).json({
        status: e.statusCode || 403,
        message: e.message || 'Forbidden',
        name: e.name
      });
    }
  }
}
  