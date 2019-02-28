"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_2 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const ts_http_errors_1 = require("ts-http-errors");
const nodejs_lite_logger_1 = require("nodejs-lite-logger");
const injector_1 = __importDefault(require("./injector"));
const helpers_1 = require("./helpers");
const authMiddleware_1 = require("./authMiddleware");
class Application {
    constructor(cb) {
        this.enableAthorization = false;
        this.logLevels = ['success'];
        this.express = express_1.default();
        this.router = express_2.default();
        this._injector = injector_1.default.getInstance();
        this.controllers = this._injector.controllers;
        this._injector.setInstance(this);
        cb ? cb(this.express) : void 0;
        this.express.use('/health', this.health.bind(this));
        this.express.use(body_parser_1.default.json());
        this.express.use(body_parser_1.default.urlencoded({ extended: false }));
        return Application._instance || (Application._instance = this);
    }
    get Injector() {
        return this._injector;
    }
    registerModule(...args) { }
    authMiddleware(req, res, next) {
        try {
            this.enableAthorization ? new authMiddleware_1.AuthMiddleware(req, res, next, this.authorizationProvider.instance, this.authorizationOptions, this.controllers)
                : next();
        }
        catch (e) {
            this.logLevels.includes('warning') && nodejs_lite_logger_1.warning(e.name, '\t', e.message);
            res.status(e.statusCode || 500).json(e);
        }
    }
    useAuthorizationProvider(provider, cb) {
        this.enableAthorization = true;
        this._injector.set(provider);
        this.authorizationProvider = {
            name: provider.name
        };
        this.authorizationOptions = new helpers_1.AuthOptions();
        cb ? cb(this.authorizationOptions) : void 0;
    }
    useConfig(cb) {
        const config = {};
        cb ? cb(config) : void 0;
        this.configProvider = new helpers_1.ConfigProvider(config);
        this._injector.setInstance(this.configProvider);
    }
    health() {
        this.configProvider.logLevels.includes('info') && nodejs_lite_logger_1.info('GET', '\t', '/health');
        arguments[1].status(200)
            .json({ status: 'live' });
    }
    handleNotFound() {
        const e = new ts_http_errors_1.NotFoundError('Not Found');
        this.handleError(e, ...arguments);
    }
    handleError(err, req, res, next) {
        const { configProvider } = Application._instance;
        if (err.statusCode) {
            configProvider.logLevels.includes('warning')
                && nodejs_lite_logger_1.warning(err.name, '\t', configProvider.printStack ? err : err.message);
            res.status(err.statusCode || 500).json(err);
        }
        else {
            configProvider.logLevels.includes('error') && nodejs_lite_logger_1.error(err);
            res.status(500).json(new ts_http_errors_1.InternalServerError(err.message));
        }
    }
    buildController(definition, name) {
        const { configProvider } = Application._instance;
        definition.instance = Application._instance.Injector.resolve(name);
        const router = express_2.default();
        const { routes, basePath, auth, instance } = definition;
        new Map([...routes.entries()]
            .sort(([path]) => path.startsWith('/:') ? 1 : -1))
            .forEach((routes, path) => Object.keys(routes).forEach((method) => {
            function handler(req, res) {
                return __awaiter(this, arguments, void 0, function* () {
                    configProvider.logLevels.includes('info')
                        && nodejs_lite_logger_1.info(method.toUpperCase(), '\t', `${basePath}${path}`, '\t', 'target: ', '\t', routes[method]['before'] && routes[method]['before'].name || '', routes[method]['origin'] && routes[method]['origin'].name || '', routes[method]['after'] && routes[method]['after'].name || '');
                    let finished = false;
                    res.on('finish', () => finished = true);
                    const stub = () => { };
                    const before = routes[method]['before'] && routes[method]['before'].handler || stub;
                    const origin = routes[method]['origin'] && routes[method]['origin'].handler || stub;
                    const after = routes[method]['after'] && routes[method]['after'].handler;
                    try {
                        yield before.apply(instance, arguments);
                        res.result = (yield origin.call(instance, new helpers_1.RequestArguments(req))) || {};
                        (yield after) && after.apply(instance, arguments);
                    }
                    catch (e) {
                        Application._instance.handleError(e, ...arguments);
                    }
                    finally {
                        process.nextTick(() => finished ? void 0 : !after && res.send(res.result));
                    }
                });
            }
            routes[method].auth = routes[method].auth === false ? false : auth;
            const authMiddleware = routes[method].auth ?
                this.authMiddleware.bind(this) :
                function () { arguments[2].call(); };
            this.express.use(basePath, router[method](path, authMiddleware, handler));
            configProvider.logLevels.includes('success')
                && nodejs_lite_logger_1.success(method.toUpperCase(), '\t', `${basePath}${path}`);
        }));
    }
    start(cb) {
        if (this.authorizationProvider) {
            this.authorizationProvider.instance = this._injector.resolve(this.authorizationProvider.name);
        }
        this.controllers.forEach(this.buildController.bind(this));
        this.express.use(this.handleNotFound.bind(this));
        this.express.use(this.handleError.bind(this));
        cb(this.express);
    }
}
exports.default = Application;
