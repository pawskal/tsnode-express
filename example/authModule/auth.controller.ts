import jwt from 'jsonwebtoken';

import { AuthService } from "./auth.service";
import { Controller, Authorization, IRequestArguments, Get, Post, ConfigProvider } from "tsnode-express";
@Authorization({ roles: ['admin', 'super'] })
@Controller('auth')
export class AuthController {
  constructor(public authService: AuthService, public config: ConfigProvider) {}

  @Post('/')
  addUser({ query }: IRequestArguments) {
    if(!query.name || !query.password) {
      throw new Error('Bad Request');
    }
    this.authService.addUser(query);
    return { success: true };
  }
 
  @Get('/')
  getUsers() {
    return this.authService.getUsers();
  }

  @Get(':name')
  getUser({ params }: IRequestArguments) {
    return this.authService.getUser(params.name);
  }

  @Get('me', { role: 'default' })
  me({ auth }: IRequestArguments) {
    return this.authService.getUser(auth.name);
  }

  @Get('sign-in', { auth: false })
  signIn({ query }: IRequestArguments) {
    const user = this.authService.getUser(query.name);

    if(!user || !user.password == query.password) {
      throw new Error('Bad Requsest');
    }
    return {
      token: jwt.sign({ name: user.name }, this.config.secret)
    }
  }
}