import { InjectedService, IInjectedService } from "../external.service";
import { Injectable, ConfigProvider } from "../../lib";

@Injectable()
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