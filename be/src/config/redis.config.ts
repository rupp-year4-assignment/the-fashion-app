import { Redis } from "ioredis";

export class RedisConfig {
  private redisClient: Redis | null = null;

  getRedisClient(): Redis {
    if (!this.redisClient) {
      const host = process.env.REDIS_HOST;
      const port = Number(process.env.REDIS_PORT);

      if (!host || !port || isNaN(port)) {
        throw new Error(
          "Redis configuration missing: REDIS_HOST and REDIS_PORT required"
        );
      }

      this.redisClient = new Redis({
        host,
        port,
        lazyConnect: true,
      });
    }
    return this.redisClient;
  }
}
