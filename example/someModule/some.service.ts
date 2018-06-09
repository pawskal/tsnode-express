import { Service, Application } from "tsnode-express";
import { ConfigProvider } from "tsnode-express";

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
