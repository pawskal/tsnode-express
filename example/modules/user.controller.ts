import { Controller, Get } from "../../lib";
import { UserService } from './user.service';


@Controller('user')
export class UserController {
  constructor(private userService: UserService){}

  @Get(':id')
  getById(req, res, next) {
    return this.userService.getData()
  }
}