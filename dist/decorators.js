"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const injector_1 = __importDefault(require("./injector"));
const { ControllerDecorator, AuthorizationDecorator, ServicDecorator, RouteDecorator } = injector_1.default.getInstance();
exports.Controller = ControllerDecorator.bind(injector_1.default.getInstance());
exports.Service = ServicDecorator.bind(injector_1.default.getInstance());
exports.Authorization = AuthorizationDecorator.bind(injector_1.default.getInstance());
exports.Get = RouteDecorator.bind(injector_1.default.getInstance(), 'origin', 'get');
exports.Post = RouteDecorator.bind(injector_1.default.getInstance(), 'origin', 'post');
exports.Put = RouteDecorator.bind(injector_1.default.getInstance(), 'origin', 'put');
exports.Patch = RouteDecorator.bind(injector_1.default.getInstance(), 'origin', 'patch');
exports.Delete = RouteDecorator.bind(injector_1.default.getInstance(), 'origin', 'delete');
exports.Before = RouteDecorator.bind(injector_1.default.getInstance(), 'before');
exports.After = RouteDecorator.bind(injector_1.default.getInstance(), 'after');
