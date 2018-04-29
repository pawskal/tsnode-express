import { Service, Application } from "../../../lib";
import { ConfigProvider } from "../../../lib/helpers";

@Service
export class UserService {
  constructor(private app: Application, private config: ConfigProvider) {
    console.log('user service constructor')
  }

  getData() {
    console.log(this.config)
    return {
      data: 'some data'
    }
  }
}
