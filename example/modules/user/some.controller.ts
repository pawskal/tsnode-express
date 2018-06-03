import jwt from 'jsonwebtoken';

import { Controller, Get, Authorization, Before, After, Post } from "../../../lib";
import { IRequestArguments } from '../../../lib/interfaces';
import { ConfigProvider } from '../../../lib/helpers';

import { SomeService } from './some.service';

// @Authorization({ role: 'super' })
@Controller('some')
export class SomeController {
  constructor(public someService: SomeService) {}

  // @Before(':id', 'GET')
  // beforeGetById(req, res, next) {
  //   console.log('BEFORE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
  //   req.body.custom = 'custom data afrer before'
  // }

  // @After(':id', 'GET')
  // AfterGetById(req, res, next) {
  //   res.result = Object.assign(res.result, req.body)
  //   console.log('After %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
  // }

  @Get('/', { auth: false })
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

  @Get(':id/data/:uid')
  getByIdAndID(data: IRequestArguments) {
    console.log(data)
    return {}
    // return this.userService.getData()
  }

  @Post('/register', { auth: false })
  async registerUser({ body }) {
  }


  @Post('/auth', { auth: false })
  async authUser({ body }) {
    // return await jwt.sign({ name: body.name }, this.configProvider.secret);
  }
}
