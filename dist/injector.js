"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
class Injector {
    constructor() {
        this.injections = new Map();
        this.instances = new Map();
        this.controllers = new Map();
        return Injector._instance || (Injector._instance = this);
    }
    static getInstance() {
        return new Injector();
    }
    resolve(targetName) {
        if (this.instances.has(targetName)) {
            return this.instances.get(targetName);
        }
        const target = this.injections.get(targetName);
        const tokens = Reflect.getMetadata('design:paramtypes', target) || [];
        const instances = tokens.map(t => this.resolve(t.name)) || [];
        this.instances.set(targetName, new target(...instances));
        return this.instances.get(targetName);
    }
    setInstance(target) {
        this.instances.set(target.constructor.name, target);
    }
    set(target) {
        this.injections.set(target.name, target);
    }
    AuthorizationDecorator(auth) {
        return (target) => {
            const controller = this.controllers.get(target.name);
            Object.assign(controller, {
                auth: true,
                roles: auth && auth.roles,
                role: auth && auth.role
            });
        };
    }
    ControllerDecorator(basePath) {
        return (target) => {
            const controller = this.controllers.get(target.name);
            Object.assign(controller, { basePath: this.normalizePath(basePath) });
            this.set(target);
        };
    }
    ServicDecorator() {
        return (target) => {
            this.set(target);
        };
    }
    RouteDecorator(type, method, path, authOption) {
        return (target, fname, descriptor) => this.defineRoute(method.toLowerCase(), type, target, path, fname, descriptor, authOption);
    }
    defineRoute(method, type, target, defaultPath, fname, descriptor, authOption) {
        if (!this.controllers.has(target.constructor.name)) {
            this.controllers.set(target.constructor.name, {
                routes: new Map()
            });
        }
        const path = this.normalizePath(defaultPath);
        const controller = this.controllers.get(target.constructor.name);
        const route = controller.routes.get(path) || {};
        const methodDefinition = route[method] || {};
        Object.assign(methodDefinition, {
            auth: authOption && authOption.auth,
            role: authOption && authOption.role,
            roles: authOption && authOption.roles,
            [type]: {
                name: fname,
                handler: descriptor.value
            }
        });
        route[method] = methodDefinition;
        controller.routes.set(path, route);
    }
    normalizePath(defaultPath) {
        if (defaultPath.endsWith('/') && !defaultPath.startsWith('/')) {
            return `/${defaultPath}`.slice(0, -1);
        }
        else if (defaultPath.endsWith('/')) {
            return defaultPath.slice(0, -1);
        }
        else if (!defaultPath.startsWith('/')) {
            return `/${defaultPath}`;
        }
        else {
            return defaultPath;
        }
    }
}
exports.default = Injector;
