import { IAuthMiddleware, IVerifyResponse } from "../../lib/interfaces";
import { ConfigProvider } from "../../lib/helpers";
import { UserService } from "./user";

@Reflect.metadata('design', 'paramtypes')
export class AuthProvider implements IAuthMiddleware {
    constructor(config: UserService){

    }

    verify(data: any): IVerifyResponse {
        console.log(data)
        return {
            success: data.name == 'pawskal'
        };
    }
}