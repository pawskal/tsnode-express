"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_http_errors_1 = require("ts-http-errors");
const helpers_1 = require("./helpers");
class AuthMiddleware {
    constructor(req, res, next, authProvider, authOptions, controllers) {
        let controllerName;
        let controllerBasePath;
        let routePath;
        let methodName;
        let role;
        let roles = [];
        controllers.forEach((controller, name) => {
            if (controller.basePath == req.baseUrl) {
                controllerName = name;
                controllerBasePath = controller.basePath;
                role = controller.role;
                roles = [...[role],
                    ...controller.roles || []];
            }
        });
        const controller = controllers.get(controllerName);
        controller.routes.forEach((route, path) => {
            if (path == req.route.path) {
                routePath = path;
                methodName = Object.keys(route).find((method) => method == req.route.stack[0].method);
            }
        });
        const methodDefinition = controller.routes.get(routePath);
        const authTarget = new helpers_1.AuthTarget({
            controller: controllerName,
            method: methodName,
            basePath: controllerBasePath,
            path: routePath,
            functionName: methodDefinition[methodName].origin && methodDefinition[methodName].origin.name ||
                methodDefinition[methodName].before && methodDefinition[methodName].before.name ||
                methodDefinition[methodName].after && methodDefinition[methodName].after.name,
            role: methodDefinition[methodName].role || role,
            roles: [...[methodDefinition[methodName].role],
                ...methodDefinition[methodName].roles || [],
                ...roles].filter((role) => role)
                .filter((role, i, roles) => roles.indexOf(role) == i),
        });
        const token = req.headers[authOptions.authorizationHeader.toLowerCase()] ||
            req.query[authOptions.authorizationQueryParam] ||
            req.body[authOptions.authorizationBodyField];
        if (!token) {
            return res.status(401)
                .json(new ts_http_errors_1.UnauthorizedError('Unauthorized'));
        }
        authProvider.verify(token, authTarget)
            .then(auth => (Object.assign(req, { auth }), next()))
            .catch(e => res.status(e.statusCode || 500).json(e));
    }
}
exports.AuthMiddleware = AuthMiddleware;
