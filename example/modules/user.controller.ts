import { Controller, Get } from "../../lib";
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService){}

  @Get(':id')
  getById(req, res, next) {
    console.log(req.params)
    return this.userService.getData()
  }

  @Get('/')
  get(req, res, next) {
    return {
      data: 'simple data'
    }
  }
}