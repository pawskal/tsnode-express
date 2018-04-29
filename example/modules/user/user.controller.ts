import { Controller, Get, Authorization, Before, After, Post } from "../../../lib";
import { UserService } from './user.service';
import { RequestArguments } from "../../../lib/helpers";
import { IRequestArguments } from "../../../lib/interfaces";

@Authorization({role: 'super'})
@Controller('user')
export class UserController {
  constructor(private userService: UserService){}

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
    console.log(data)
    return this.userService.getData()
  }

  @Get('/', { auth: false })
  get(req, res, next) {
    return {
      data: 'simple data'
    }
  }

  @Post(':id')
  postById(req, res, next) {
    return {
      data: 'simple data'
    }
  }
}
