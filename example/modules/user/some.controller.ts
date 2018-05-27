import jwt from 'jsonwebtoken';

import { Controller, Get, Authorization, Before, After, Post } from "../../../lib";
import { IRequestArguments } from '../../../lib/interfaces';
import { ConfigProvider } from '../../../lib/helpers';

import { SomeService } from './some.service';

@Authorization({ role: 'super' })
@Controller('some')
export class SomeController {
  constructor(private userService: SomeService, private config: ConfigProvider) {
    console.log(config, config)
  }

  @Before(':id', 'GET')
  beforeGetById(req, res, next) {
    console.log('BEFORE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    req.body.custom = 'custom data afrer before'
  }

  @After(':id', 'GET')
  AfterGetById(req, res, next) {
    res.result = Object.assign(res.result, req.body)
    console.log('After %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
  }

  @Get(':id', { role: 'admin' })
  getById(data: IRequestArguments) {
    console.log(data, '))))))))))))))))))ы')
    return {data: 'datas'}
    // return this.userService.getData()
  }

  @Get(':id/data/:uid')
  getByIdAndID(data: IRequestArguments) {
    console.log(data)
    return {}
    // return this.userService.getData()
  }

  @Get('/', { auth: false })
  async get(data: IRequestArguments) {
    return {
      data: "hello anna"
    }
    // return await this.userService.getAll(data.query);
  }

  @Post('/register', { auth: false })
  async registerUser({ body }) {
  }


  @Post('/auth', { auth: false })
  async authUser({ body }) {
    return await jwt.sign({ name: body.name }, this.config.secret);
  }
}
