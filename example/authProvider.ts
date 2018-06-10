import jwt from 'jsonwebtoken'

import { IAuthProvider, IVerifyResponse, IAuthTarget } from "tsnode-express";
import { ConfigProvider } from "tsnode-express";
import { AuthService } from './authModule';


@Reflect.metadata('design', 'paramtypes')
export class AuthProvider implements IAuthProvider {
  constructor(public config: ConfigProvider, public authService: AuthService) {}
  verify(token: string, authTarget: IAuthTarget): IVerifyResponse {
    console.log(authTarget)
    console.log(token)
    const data: any = jwt.verify(token, this.config.secret)
    const user = this.authService.getUser(data.name)
    return {
      success: authTarget.roles.includes(user.role),
      data: user
    };
  }
}