"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthOptions {
    constructor() {
        this.authorizationHeader = 'authorization';
        this.authorizationQueryParam = 'access_token';
        this.authorizationBodyField = 'accessToken';
    }
}
exports.AuthOptions = AuthOptions;
class ConfigProvider {
    constructor(config) {
        Object.assign(this, { logLevels: [], printStack: false }, config);
    }
}
exports.ConfigProvider = ConfigProvider;
class RequestArguments {
    constructor({ body, params, query, auth }) {
        this.body = body;
        this.params = params;
        this.auth = auth;
        this.query = query;
    }
}
exports.RequestArguments = RequestArguments;
class AuthTarget {
    constructor({ basePath, path }) {
        Object.assign(this, arguments[0]);
        this.fullPath = `${basePath}${path}`;
    }
}
exports.AuthTarget = AuthTarget;
