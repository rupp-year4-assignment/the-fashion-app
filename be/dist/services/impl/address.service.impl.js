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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const badRequest_exception_1 = __importDefault(require("../../exceptions/badRequest.exception"));
const notFound_exception_1 = __importDefault(require("../../exceptions/notFound.exception"));
const user_1 = __importDefault(require("../../models/user"));
const mongoose_1 = require("mongoose");
class AddressServiceImpl {
    constructor() {
        this.userModel = user_1.default.getModel();
    }
    normalizeAddressType(value) {
        const normalized = this.normalizeText(value, "USER_DELIVERY").toUpperCase();
        if (normalized === "SHOP_ORIGIN") {
            return "SHOP_ORIGIN";
        }
        return "USER_DELIVERY";
    }
    normalizeText(value, fallback = "") {
        if (typeof value !== "string") {
            return fallback;
        }
        const normalized = value.trim();
        return normalized.length > 0 ? normalized : fallback;
    }
    parseCoordinates(location) {
        if (!location || typeof location !== "object") {
            throw new badRequest_exception_1.default("Location is required.");
        }
        const rawType = this.normalizeText(location.type, "Point").toUpperCase();
        if (rawType !== "POINT") {
            throw new badRequest_exception_1.default("Location type must be Point.");
        }
        const rawCoordinates = location.coordinates;
        if (!Array.isArray(rawCoordinates) ||
            rawCoordinates.length !== 2 ||
            !Number.isFinite(Number(rawCoordinates[0])) ||
            !Number.isFinite(Number(rawCoordinates[1]))) {
            throw new badRequest_exception_1.default("Location coordinates must be [longitude, latitude].");
        }
        const lng = Number(rawCoordinates[0]);
        const lat = Number(rawCoordinates[1]);
        if (lng < -180 || lng > 180) {
            throw new badRequest_exception_1.default("Longitude must be between -180 and 180.");
        }
        if (lat < -90 || lat > 90) {
            throw new badRequest_exception_1.default("Latitude must be between -90 and 90.");
        }
        return { type: "Point", coordinates: [lng, lat] };
    }
    normalizeLocationForResponse(value) {
        if (value && typeof value === "object") {
            const coordinates = value.coordinates;
            if (Array.isArray(coordinates) &&
                coordinates.length === 2 &&
                Number.isFinite(Number(coordinates[0])) &&
                Number.isFinite(Number(coordinates[1]))) {
                return {
                    type: "Point",
                    coordinates: [Number(coordinates[0]), Number(coordinates[1])],
                };
            }
        }
        return { type: "Point", coordinates: [104.9282, 11.5564] };
    }
    toResponse(address) {
        var _a, _b, _c, _d, _e;
        const location = this.normalizeLocationForResponse(address.location);
        const createdAt = address.createdAt != null ? new Date(address.createdAt) : new Date();
        const updatedAt = address.updatedAt != null ? new Date(address.updatedAt) : createdAt;
        return {
            id: String((_b = (_a = address.id) !== null && _a !== void 0 ? _a : address._id) !== null && _b !== void 0 ? _b : ""),
            addressType: this.normalizeAddressType(address.addressType),
            label: this.normalizeText(address.label, "Home"),
            street: this.normalizeText(address.street),
            city: this.normalizeText(address.city),
            state: this.normalizeText(address.state),
            postalCode: this.normalizeText((_c = address.postalCode) !== null && _c !== void 0 ? _c : address.zip),
            country: this.normalizeText(address.country, "Cambodia"),
            location,
            isDefault: Boolean((_e = (_d = address.isDefault) !== null && _d !== void 0 ? _d : address.isDefualt) !== null && _e !== void 0 ? _e : false),
            createdAt,
            updatedAt,
        };
    }
    ensureRequiredAddressFields(payload) {
        if (!this.normalizeText(payload.street)) {
            throw new badRequest_exception_1.default("Street is required.");
        }
        if (!this.normalizeText(payload.city)) {
            throw new badRequest_exception_1.default("City is required.");
        }
        if (!this.normalizeText(payload.state)) {
            throw new badRequest_exception_1.default("State is required.");
        }
        if (!this.normalizeText(payload.postalCode)) {
            throw new badRequest_exception_1.default("Postal code is required.");
        }
        if (!this.normalizeText(payload.country)) {
            throw new badRequest_exception_1.default("Country is required.");
        }
    }
    getUserDocument(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userModel.findById(new mongoose_1.Types.ObjectId(userId.toString()));
            if (!user) {
                throw new notFound_exception_1.default("User not found.");
            }
            return user;
        });
    }
    extractAddresses(user) {
        if (!Array.isArray(user.addresses)) {
            return [];
        }
        return [...user.addresses];
    }
    ensureOneDefault(addresses) {
        if (addresses.length === 0) {
            return addresses;
        }
        const hasDefault = addresses.some((item) => item.isDefault === true || item.isDefualt === true);
        if (!hasDefault) {
            addresses[0].isDefault = true;
            addresses[0].isDefualt = false;
        }
        return addresses;
    }
    getAddressesByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userModel
                .findById(new mongoose_1.Types.ObjectId(userId.toString()))
                .lean()
                .exec();
            if (!user) {
                throw new notFound_exception_1.default("User not found.");
            }
            const addresses = Array.isArray(user.addresses) ? user.addresses : [];
            const normalized = addresses
                .map((address) => this.toResponse(address))
                .filter((address) => address.addressType === "USER_DELIVERY")
                .sort((a, b) => {
                if (a.isDefault && !b.isDefault)
                    return -1;
                if (!a.isDefault && b.isDefault)
                    return 1;
                return b.createdAt.getTime() - a.createdAt.getTime();
            });
            return normalized;
        });
    }
    addAddress(userId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureRequiredAddressFields(payload);
            const location = this.parseCoordinates(payload.location);
            const user = yield this.getUserDocument(userId);
            const addresses = this.extractAddresses(user);
            const now = new Date();
            const created = {
                id: new mongoose_1.Types.ObjectId().toString(),
                addressType: "USER_DELIVERY",
                label: this.normalizeText(payload.label, "Home"),
                street: this.normalizeText(payload.street),
                city: this.normalizeText(payload.city),
                state: this.normalizeText(payload.state),
                postalCode: this.normalizeText(payload.postalCode),
                country: this.normalizeText(payload.country),
                location,
                isDefault: payload.isDefault === true || addresses.length === 0,
                createdAt: now,
                updatedAt: now,
            };
            if (created.isDefault) {
                for (const address of addresses) {
                    address.isDefault = false;
                    address.isDefualt = false;
                }
            }
            addresses.unshift(created);
            user.addresses = this.ensureOneDefault(addresses);
            yield user.save();
            return this.toResponse(created);
        });
    }
    updateAddress(userId, addressId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const user = yield this.getUserDocument(userId);
            const addresses = this.extractAddresses(user);
            const index = addresses.findIndex((item) => {
                var _a, _b;
                const id = String((_b = (_a = item.id) !== null && _a !== void 0 ? _a : item._id) !== null && _b !== void 0 ? _b : "");
                return id === addressId;
            });
            if (index < 0) {
                throw new notFound_exception_1.default("Address not found.");
            }
            const existing = Object.assign({}, addresses[index]);
            if (payload.label != null) {
                existing.label = this.normalizeText(payload.label, (_a = existing.label) !== null && _a !== void 0 ? _a : "Home");
            }
            if (payload.addressType != null) {
                const type = this.normalizeAddressType(payload.addressType);
                if (type !== "USER_DELIVERY") {
                    throw new badRequest_exception_1.default("User address book only supports USER_DELIVERY address type.");
                }
                existing.addressType = type;
            }
            if (payload.street != null) {
                existing.street = this.normalizeText(payload.street, existing.street);
            }
            if (payload.city != null) {
                existing.city = this.normalizeText(payload.city, existing.city);
            }
            if (payload.state != null) {
                existing.state = this.normalizeText(payload.state, existing.state);
            }
            if (payload.postalCode != null) {
                existing.postalCode = this.normalizeText(payload.postalCode, (_b = existing.postalCode) !== null && _b !== void 0 ? _b : existing.zip);
                existing.zip = existing.postalCode;
            }
            if (payload.country != null) {
                existing.country = this.normalizeText(payload.country, existing.country);
            }
            if (payload.location != null) {
                existing.location = this.parseCoordinates(payload.location);
            }
            if (payload.isDefault != null) {
                existing.isDefault = payload.isDefault;
                existing.isDefualt = payload.isDefault;
            }
            existing.updatedAt = new Date();
            addresses[index] = existing;
            if (existing.isDefault === true || existing.isDefualt === true) {
                for (let i = 0; i < addresses.length; i += 1) {
                    if (i !== index) {
                        addresses[i].isDefault = false;
                        addresses[i].isDefualt = false;
                    }
                }
            }
            user.addresses = this.ensureOneDefault(addresses);
            yield user.save();
            return this.toResponse(addresses[index]);
        });
    }
    removeAddress(userId, addressId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.getUserDocument(userId);
            const addresses = this.extractAddresses(user);
            const index = addresses.findIndex((item) => {
                var _a, _b;
                const id = String((_b = (_a = item.id) !== null && _a !== void 0 ? _a : item._id) !== null && _b !== void 0 ? _b : "");
                return id === addressId;
            });
            if (index < 0) {
                throw new notFound_exception_1.default("Address not found.");
            }
            addresses.splice(index, 1);
            user.addresses = this.ensureOneDefault(addresses);
            yield user.save();
        });
    }
    setDefaultAddress(userId, addressId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const user = yield this.getUserDocument(userId);
            const addresses = this.extractAddresses(user);
            let found = false;
            const now = new Date();
            for (const address of addresses) {
                const id = String((_b = (_a = address.id) !== null && _a !== void 0 ? _a : address._id) !== null && _b !== void 0 ? _b : "");
                const isDefault = id === addressId;
                if (isDefault) {
                    found = true;
                }
                address.isDefault = isDefault;
                address.isDefualt = isDefault;
                address.updatedAt = now;
            }
            if (!found) {
                throw new notFound_exception_1.default("Address not found.");
            }
            user.addresses = this.ensureOneDefault(addresses);
            yield user.save();
            const selected = addresses.find((item) => { var _a, _b; return String((_b = (_a = item.id) !== null && _a !== void 0 ? _a : item._id) !== null && _b !== void 0 ? _b : "") === addressId; });
            return this.toResponse(selected);
        });
    }
}
exports.default = AddressServiceImpl;
