"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERIFICATION_PURPOSES = void 0;
const crypto_1 = require("crypto");
const ioredis_1 = require("ioredis");
exports.VERIFICATION_PURPOSES = ["register", "password_reset"];
class RedisUtils {
    constructor() {
        this.memoryStore = new Map();
        this.hasLoggedFallback = false;
    }
    get ttlSeconds() {
        return 60 * 15;
    }
    normalizeEmail(email) {
        return email.trim().toLowerCase();
    }
    verificationCodeKey(email, purpose) {
        return `verification-code:${purpose}:${this.normalizeEmail(email)}`;
    }
    verificationTokenKey(email, purpose) {
        return `verification-token:${purpose}:${this.normalizeEmail(email)}`;
    }
    isRedisConfigured() {
        var _a;
        const host = (_a = process.env.REDIS_HOST) === null || _a === void 0 ? void 0 : _a.trim();
        const port = Number(process.env.REDIS_PORT);
        return Boolean(host) && Number.isFinite(port) && port > 0;
    }
    getRedisClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.redisClient !== undefined) {
                return this.redisClient;
            }
            if (!this.isRedisConfigured()) {
                this.redisClient = null;
                return null;
            }
            const client = new ioredis_1.Redis({
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT),
                lazyConnect: true,
                maxRetriesPerRequest: 1,
                enableOfflineQueue: false,
            });
            client.on("error", (error) => {
                if (!this.hasLoggedFallback) {
                    console.warn("Redis unavailable for OTP storage. Falling back to in-memory store:", error.message);
                    this.hasLoggedFallback = true;
                }
            });
            try {
                yield client.connect();
                this.redisClient = client;
                return client;
            }
            catch (error) {
                client.disconnect();
                this.redisClient = null;
                if (!this.hasLoggedFallback) {
                    const message = error instanceof Error ? error.message : "Unknown Redis error";
                    console.warn("Redis unavailable for OTP storage. Falling back to in-memory store:", message);
                    this.hasLoggedFallback = true;
                }
                return null;
            }
        });
    }
    setMemoryValue(key, value, ttlSeconds) {
        this.memoryStore.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }
    getMemoryValue(key) {
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
    deleteMemoryValue(key) {
        this.memoryStore.delete(key);
    }
    setValue(key, value, ttlSeconds) {
        return __awaiter(this, void 0, void 0, function* () {
            const redisClient = yield this.getRedisClient();
            if (redisClient) {
                yield redisClient.set(key, value, "EX", ttlSeconds);
                return;
            }
            this.setMemoryValue(key, value, ttlSeconds);
        });
    }
    getValue(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const redisClient = yield this.getRedisClient();
            if (redisClient) {
                return redisClient.get(key);
            }
            return this.getMemoryValue(key);
        });
    }
    deleteValue(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const redisClient = yield this.getRedisClient();
            if (redisClient) {
                yield redisClient.del(key);
                return;
            }
            this.deleteMemoryValue(key);
        });
    }
    saveCodeVerification(email, purpose, code) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setValue(this.verificationCodeKey(email, purpose), code.trim(), this.ttlSeconds);
            yield this.deleteValue(this.verificationTokenKey(email, purpose));
        });
    }
    consumeCodeVerification(email, purpose, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.verificationCodeKey(email, purpose);
            const storedCode = yield this.getValue(key);
            if (!storedCode || storedCode !== code.trim()) {
                return false;
            }
            yield this.deleteValue(key);
            return true;
        });
    }
    issueVerificationToken(email, purpose) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = (0, crypto_1.randomUUID)();
            yield this.setValue(this.verificationTokenKey(email, purpose), token, this.ttlSeconds);
            return token;
        });
    }
    consumeVerificationToken(email, purpose, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.verificationTokenKey(email, purpose);
            const storedToken = yield this.getValue(key);
            if (!storedToken || storedToken !== token.trim()) {
                return false;
            }
            yield this.deleteValue(key);
            return true;
        });
    }
}
exports.default = new RedisUtils();
