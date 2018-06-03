import { Controller, Get, Before, After, Post } from "../../../lib";
import { IRequestArguments } from '../../../lib/interfaces';
import { ConfigProvider } from '../../../lib/helpers';

import { SomeService } from './some.service';

@Controller('some')
export class SomeController {
  constructor(public someService: SomeService) {}

  @Get('/')
  getSuccess(data: IRequestArguments) {
    return { data: "success" }
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
  beforeWithHooks(req, res, next) {
    req.body.before = 'before hook'
  }

  @Get('/hooks')
  withHooks(args: IRequestArguments) {
    return {
      origin: 'original method'
    }
  }

  @After('GET', '/hooks')
  afterWithHooks(req, res, next) {
    res.result = Object.assign(req.body, res.result, { after: 'after hook' })
  }

  @Before('GET', '/single-before-hook/:param')
  singleBeforeHook(req, res, next) {
    res.send({ break: `Before hook catch ${req.params.param} param` })
  }

  @After('GET', '/single-after-hook/:param')
  singleAfterHook(req, res, next) {
    res.send({ break: `After hook catch ${req.params.param} param` })
  }
}
