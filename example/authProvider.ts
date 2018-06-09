import { IAuthMiddleware, IVerifyResponse, IAuthTarget } from "tsnode-express";
import { ConfigProvider } from "tsnode-express";


@Reflect.metadata('design', 'paramtypes')
export class AuthProvider implements IAuthMiddleware {
  constructor(config: ConfigProvider) {}
  verify(data: any, authTarget: IAuthTarget): IVerifyResponse {
    return {
    success: data.name == 'JDoe',
      data
    };
  }
}