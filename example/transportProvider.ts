import { IRedisTransportProvider, IRequestArguments, ConfigProvider } from "tsnode-express";
import { success, warning, error, info } from 'nodejs-lite-logger';
import AsyncRedis from "./asyncRedis";

@Reflect.metadata('design', 'paramtypes')
export class TransportProvider extends IRedisTransportProvider {

    publish(path: string, args: IRequestArguments): void {
       this.redisClient.publish('example', JSON.stringify({ message: 'test'}))
    }

    subscribe(channelName: string): void {
        this.redisClient.on('message', (data) => console.log(data, '##########'))
        this.redisClient.subscribe(channelName);
        success(`Subscribed to channel - ${channelName}`);
    }

    constructor(config: ConfigProvider, protected redisClient: AsyncRedis){
        super();
        this.channel = config.transportChannel;
    }
}