import { IAuthMiddleware, IVerifyResponse } from "../../lib/interfaces";
import { ConfigProvider } from "../../lib/helpers";


@Reflect.metadata('design', 'paramtypes')
export class AuthProvider implements IAuthMiddleware {
    constructor(config: ConfigProvider) {

    }

    verify(data: any, authTarget): IVerifyResponse {
        console.log(authTarget)
        return {
            success: data.name == 'pawskal',
            data
        };
    }
}