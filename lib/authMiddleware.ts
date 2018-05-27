import jwt from 'jsonwebtoken';

import { IAuthMiddleware,
         IAuthOptions,
         IRequest, 
         IResponse, 
         IAuthTarget, 
         IController, 
         IRoutes } from './interfaces';

import { AuthTarget } from './helpers';

export class AuthMiddleware {
  constructor(req: IRequest, res: IResponse, next: Function, authProvider: IAuthMiddleware,
              authOptions: IAuthOptions, controllers: Map<string, IController>) {

    let controllerName: string;
    let controllerBasePath: string;
    let routePath: string;
    let methodName: string;
    let role = 'default';
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
                ...roles].filter((role) => role),
    });

    const token = req.headers[authOptions.authorizationHeader.toLowerCase()] ||
                  req.query[authOptions.authorizationQueryParam] ||
                  req.query[authOptions.authorizationBodyField];
    if(!token) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const { success, data } = authOptions.strategy == 'jwt' ?
                              authProvider.verify(jwt.verify(token, authOptions.secret), authTarget) :
                              authProvider.verify(token, authTarget);
    if(!success) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    req.auth = data;
    next();
  }
}
  