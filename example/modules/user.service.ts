import { Service, Application } from "../../lib";
import { ConfigProvider } from "../../lib/application";

@Service
export class UserService {
  constructor(private app: Application, private config: Application) {
    console.log('user service constructor')
  }

  getData() {
    console.log(this.config)
    return {
      data: 'some data'
    }
  }
}