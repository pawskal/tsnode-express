import { Service } from "tsnode-express";
import { ConfigProvider } from "tsnode-express";
import { InjectedService, IInjectedService } from "../external.service";

@Service()
export class SomeService {
    constructor(
        public configProvider: ConfigProvider,
        public injectedService: InjectedService,
        public iInjectedService: IInjectedService
    ) {}

    getSomeData() {
        return {
            data: "from service",
            configField: this.configProvider.test
        }
    }

    getInjectedData() {
        return {
            injectedService: this.injectedService.stub,
            iInjectedService: this.iInjectedService.stub,
        }
    }
}