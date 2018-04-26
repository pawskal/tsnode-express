import { Controller, Get, Authorization } from "../../lib";
import { UserService } from './user.service';

@Authorization
@Controller('user')
export class UserController {
  constructor(private userService: UserService){}

  @Get(':id')
  getById(req, res, next) {
    console.log(req.params)
    return this.userService.getData()
  }

  @Get('', { auth: false })
  get(req, res, next) {
    return {
      data: 'simple data'
    }
  }
}