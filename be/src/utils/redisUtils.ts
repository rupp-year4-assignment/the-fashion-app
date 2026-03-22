import { randomUUID } from "crypto";
import { Redis } from "ioredis";

export const VERIFICATION_PURPOSES = ["register", "password_reset"] as const;
export type VerificationPurpose = (typeof VERIFICATION_PURPOSES)[number];

type MemoryEntry = {
  value: string;
  expiresAt: number;
};

class RedisUtils {
  private redisClient: Redis | null | undefined;
  private readonly memoryStore = new Map<string, MemoryEntry>();
  private hasLoggedFallback = false;

  private get ttlSeconds(): number {
    return 60 * 15;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private verificationCodeKey(
    email: string,
    purpose: VerificationPurpose
  ): string {
    return `verification-code:${purpose}:${this.normalizeEmail(email)}`;
  }

  private verificationTokenKey(
    email: string,
    purpose: VerificationPurpose
  ): string {
    return `verification-token:${purpose}:${this.normalizeEmail(email)}`;
  }

  private isRedisConfigured(): boolean {
    const host = process.env.REDIS_HOST?.trim();
    const port = Number(process.env.REDIS_PORT);

    return Boolean(host) && Number.isFinite(port) && port > 0;
  }

  private async getRedisClient(): Promise<Redis | null> {
    if (this.redisClient !== undefined) {
      return this.redisClient;
    }

    if (!this.isRedisConfigured()) {
      this.redisClient = null;
      return null;
    }

    const client = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });

    client.on("error", (error) => {
      if (!this.hasLoggedFallback) {
        console.warn(
          "Redis unavailable for OTP storage. Falling back to in-memory store:",
          error.message
        );
        this.hasLoggedFallback = true;
      }
    });

    try {
      await client.connect();
      this.redisClient = client;
      return client;
    } catch (error) {
      client.disconnect();
      this.redisClient = null;
      if (!this.hasLoggedFallback) {
        const message =
          error instanceof Error ? error.message : "Unknown Redis error";
        console.warn(
          "Redis unavailable for OTP storage. Falling back to in-memory store:",
          message
        );
        this.hasLoggedFallback = true;
      }
      return null;
    }
  }

  private setMemoryValue(key: string, value: string, ttlSeconds: number): void {
    this.memoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  private getMemoryValue(key: string): string | null {
    const entry = this.memoryStore.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.memoryStore.delete(key);
      return null;
    }

    return entry.value;
  }

  private deleteMemoryValue(key: string): void {
    this.memoryStore.delete(key);
  }

  private async setValue(
    key: string,
    value: string,
    ttlSeconds: number
  ): Promise<void> {
    const redisClient = await this.getRedisClient();

    if (redisClient) {
      await redisClient.set(key, value, "EX", ttlSeconds);
      return;
    }

    this.setMemoryValue(key, value, ttlSeconds);
  }

  private async getValue(key: string): Promise<string | null> {
    const redisClient = await this.getRedisClient();

    if (redisClient) {
      return redisClient.get(key);
    }

    return this.getMemoryValue(key);
  }

  private async deleteValue(key: string): Promise<void> {
    const redisClient = await this.getRedisClient();

    if (redisClient) {
      await redisClient.del(key);
      return;
    }

    this.deleteMemoryValue(key);
  }

  async saveCodeVerification(
    email: string,
    purpose: VerificationPurpose,
    code: string
  ): Promise<void> {
    await this.setValue(
      this.verificationCodeKey(email, purpose),
      code.trim(),
      this.ttlSeconds
    );
    await this.deleteValue(this.verificationTokenKey(email, purpose));
  }

  async consumeCodeVerification(
    email: string,
    purpose: VerificationPurpose,
    code: string
  ): Promise<boolean> {
    const key = this.verificationCodeKey(email, purpose);
    const storedCode = await this.getValue(key);

    if (!storedCode || storedCode !== code.trim()) {
      return false;
    }

    await this.deleteValue(key);
    return true;
  }

  async issueVerificationToken(
    email: string,
    purpose: VerificationPurpose
  ): Promise<string> {
    const token = randomUUID();

    await this.setValue(
      this.verificationTokenKey(email, purpose),
      token,
      this.ttlSeconds
    );

    return token;
  }

  async consumeVerificationToken(
    email: string,
    purpose: VerificationPurpose,
    token: string
  ): Promise<boolean> {
    const key = this.verificationTokenKey(email, purpose);
    const storedToken = await this.getValue(key);

    if (!storedToken || storedToken !== token.trim()) {
      return false;
    }

    await this.deleteValue(key);
    return true;
  }
}

export default new RedisUtils();
