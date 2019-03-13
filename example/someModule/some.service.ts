import { Service, Application } from "tsnode-express";
import { ConfigProvider } from "tsnode-express";
import { RedisService, IRedis } from "../redis.service";

@Service()
export class SomeService {
  constructor(public configProvider: ConfigProvider, redis: RedisService, iRedis: IRedis) {
    console.dir(iRedis)
    iRedis.on('connect', () => {
      console.log('CONNECT !!!!!!!!!!!!!!!!!!!!!!!')
    })
  }
  getSomeData() {
    return {
      data: "from service",
      configField: this.configProvider.test
    }
  }
}
