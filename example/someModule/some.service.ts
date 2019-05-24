import { Service } from "tsnode-express";
import { ConfigProvider } from "tsnode-express";
import { InjectedService, IInjectedService } from "../external.service";
import {IRequestArguments} from "../../dist/interfaces";
import {HttpMethods} from "../../lib/interfaces";

@Service()
export class SomeService {
  constructor(
    public configProvider: ConfigProvider,
    public injectedService: InjectedService,
    public iInjectedService: IInjectedService,
  ) {}

  getSomeData(payload: IRequestArguments) {
      return {
          type: "TEST",
          method: HttpMethods.GET,
          url: 'test/:testParam',
          payload,
      };
  }

  getInjectedData() {
    return {
      injectedService: this.injectedService.stub,
      iInjectedService: this.iInjectedService.stub,
    }
  }
}
