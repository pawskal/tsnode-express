import { Service, Application } from "../../../lib";
import { ConfigProvider } from "../../../lib/helpers";

@Service()
export class SomeService {
  constructor(public configProvider: ConfigProvider) {}
  getSomeData() {
    return {
        data: "from service",
        configField: this.configProvider.test
    }
  }
}
