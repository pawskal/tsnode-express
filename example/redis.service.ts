import { RedisClient } from "redis";

export class RedisService extends RedisClient {
  constructor() {
    super({
      host: 'redis-14061.c14.us-east-1-3.ec2.cloud.redislabs.com',
      port: 14061,
      password: 'NQh66zuuYvJW1oQ72UIRKD5PTKuMQDJT',
      url: 'redis://redis-14061.c14.us-east-1-3.ec2.cloud.redislabs.com:14061?password=NQh66zuuYvJW1oQ72UIRKD5PTKuMQDJT'
    });
    console.dir('$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
    // Object.assign(this, redis.createClient({}))
  }
}

export interface IRedis extends RedisClient{};