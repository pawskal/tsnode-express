import { Controller, Get, Authorization, Before, After, Post } from "../../../lib";
import { UserService } from './user.service';
import { IRequestArguments } from '../../../lib/interfaces';
import jwt from 'jsonwebtoken';
import { ConfigProvider } from '../../../lib/helpers';
import SearchService from '../search/search.service';

// @Authorization({ role: 'super' })
@Controller('users')
export class UserController {
  constructor(private userService: UserService, private config: ConfigProvider, private search: SearchService) {
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
    console.log(data)
    // return this.userService.getData()
  }

  @Get(':id/data/:uid')
  getByIdAndID(data: IRequestArguments) {
    console.log(data)
    // return this.userService.getData()
  }

  @Get('/', { auth: false })
  async get(data: IRequestArguments) {
    return await this.userService.getAll(data.query);
  }

  @Get('/search',{auth: false})
  async getSearchResult() {
    return await this.search.get()
  }

  @Post('/register', { auth: false })
  async registerUser({ body }) {
    return await this.userService.create(body);
  }


  @Post('/auth', { auth: false })
  async authUser({ body }) {
    return await jwt.sign({ name: body.name }, this.config.config.secret);
  }
}
