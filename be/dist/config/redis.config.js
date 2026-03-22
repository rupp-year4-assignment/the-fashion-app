"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisConfig = void 0;
const ioredis_1 = require("ioredis");
class RedisConfig {
    constructor() {
        this.redisClient = null;
    }
    getRedisClient() {
        if (!this.redisClient) {
            const host = process.env.REDIS_HOST;
            const port = Number(process.env.REDIS_PORT);
            if (!host || !port || isNaN(port)) {
                throw new Error("Redis configuration missing: REDIS_HOST and REDIS_PORT required");
            }
            this.redisClient = new ioredis_1.Redis({
                host,
                port,
                lazyConnect: true,
            });
        }
        return this.redisClient;
    }
}
exports.RedisConfig = RedisConfig;
