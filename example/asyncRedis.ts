import {ClientOpts, RedisClient} from 'redis';
import { promisify } from 'util';

export default class AsyncRedis extends RedisClient {
    constructor(options: ClientOpts) {
        super(options);
    }

    public readonly zaddAsync: (key: string, score: number, member: string) => Promise<number> = promisify(this.zadd).bind(this);
    public readonly setAsync: (key: string, value: string) => Promise<string> = promisify(this.set).bind(this);
    public readonly setnxAsync: (key: string, value: string) => Promise<number> = promisify(this.setnx).bind(this);
    public readonly getAsync: (key: string) => Promise<string> = promisify(this.get).bind(this);
    public readonly delAsync: (keys: Array<string> | string) => Promise<number> = promisify(this.del).bind(this);
    public readonly zremAsync: (key: string, member: string) => Promise<number> = promisify(this.zrem).bind(this);
    public readonly existsAsync: (key: string) => Promise<number> = promisify(this.exists).bind(this);
    public readonly zrangeAsync: (key: string, offset: number, limit: number) => Promise<string[]> = promisify(this.zrange).bind(this);
    public readonly mgetAsync: (fields: string[]) => Promise<string[]> = promisify(this.mget).bind(this);
    public readonly hmsetAsync: (key: string, fields: Array<string>) => Promise<number> = promisify(this.hmset).bind(this);
    public readonly hgetallAsync: (key: string) => Promise<object> = promisify(this.hgetall).bind(this);
    public readonly smembersAsync: (key: string) => Promise<Array<string>> = promisify(this.smembers).bind(this);
    public readonly saddAsync: (key: string, members: string) => Promise<number> = promisify(this.sadd).bind(this);
    public readonly expireAsync: (key: string, expiresAt: number) => Promise<number> = promisify(this.expire).bind(this);
}
