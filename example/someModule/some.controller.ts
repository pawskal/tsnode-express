import { Injectable } from "../../lib";
import { Controller, Get, Before, After, Post } from '../httpPlugin/decorators';

// import { SomeService } from './some.service';
import { BadRequestError } from "ts-http-errors";
import uuidv4 from 'uuidv4';
import { IController, IRequestArguments, IRequest, IResponse } from "../httpPlugin/interfaces";
import { ResolveTypes } from "../../lib/interfaces";
import { SomeService } from ".";
// import {TestDecorator} from "../simplePlugin";

@Controller('some')
@Injectable(ResolveTypes.SCOPED)
export class SomeController implements IController {
    req?: import("express").Request;
    res?: import("express").Response;
    next: Function;
    id: string;
    constructor(public someService: SomeService) {
        this.id = uuidv4()
    }

    // @TestDecorator()
    @Get('/')
    getSuccess(args: IRequestArguments) {
        return { data: "success", controllerId: this.id }
    }

    @Get('/service')
    getFromService(args: IRequestArguments) {
        return this.someService.getSomeData()
    }

    @Post('echo/:param')
    echo({ body, params, query }: IRequestArguments) {
        return {
            body: body.data,
            params: params.param,
            query: query.echo
        }
    }

    @Before('GET', '/hooks')
    beforeWithHooks(req: IRequest, res: IResponse, next: Function) {
        req.body.before = 'before hook'
    }

    // @TestDecorator()
    @Get('/hooks')
    withHooks(args: IRequestArguments) {
        return {
            origin: 'original method'
        }
    }

    @After('GET', '/hooks')
    afterWithHooks(req: IRequest, res: IResponse, next: Function) {
        res.result = Object.assign(req.body, res.result, { after: 'after hook' })
        res.json(res.result)
    }

    @Before('GET', '/single-before-hook/:param')
    singleBeforeHook(req: IRequest, res: IResponse, next: Function) {
        res.send({ break: `Before hook catch ${req.params.param} param` })
    }

    @After('GET', '/single-after-hook/:param')
    singleAfterHook(req: IRequest, res: IResponse, next: Function) {
        res.send({ break: `After hook catch ${req.params.param} param` })
    }

    @Get('/custom-error')
    badRequest(args: IRequestArguments) {
        throw new BadRequestError('custom error')
    }

    @Get('/internal-error')
    internalError(args: IRequestArguments) {
        let unknown: string;
        unknown.charCodeAt(0);
    }

    @Get('/from-external-service')
    fromExternalServices(args: IRequestArguments) {
        return this.someService.getInjectedData();
    }
}