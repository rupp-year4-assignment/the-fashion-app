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
const shop_address_1 = __importDefault(require("../../models/shop_address"));
class ShopAddressServiceImpl {
    constructor() {
        this.model = shop_address_1.default.getModel();
        this.defaultShop = {
            label: "Main Shop",
            street: "Angk Snuol",
            city: "Angk Snuol",
            state: "Kandal",
            postalCode: "120904",
            country: "Cambodia",
            location: {
                type: "Point",
                coordinates: [104.713525, 11.568267],
            },
        };
        this.legacyFallbackCoordinates = [
            104.9282,
            11.5564,
        ];
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
        return [lng, lat];
    }
    assertPayload(payload) {
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
    toResponse(doc) {
        var _a;
        const coordinates = Array.isArray((_a = doc.location) === null || _a === void 0 ? void 0 : _a.coordinates)
            ? doc.location.coordinates
            : this.defaultShop.location.coordinates;
        return {
            id: doc._id.toString(),
            label: this.normalizeText(doc.label, this.defaultShop.label),
            street: this.normalizeText(doc.street),
            city: this.normalizeText(doc.city),
            state: this.normalizeText(doc.state),
            postalCode: this.normalizeText(doc.postalCode),
            country: this.normalizeText(doc.country, this.defaultShop.country),
            location: {
                type: "Point",
                coordinates: [Number(coordinates[0]), Number(coordinates[1])],
            },
            isDefault: Boolean(doc.isDefault),
            isActive: Boolean(doc.isActive),
            createdAt: new Date(doc.createdAt),
            updatedAt: new Date(doc.updatedAt),
        };
    }
    createFallbackDefault() {
        return __awaiter(this, void 0, void 0, function* () {
            const created = yield this.model.create(Object.assign(Object.assign({}, this.defaultShop), { isDefault: true, isActive: true }));
            return this.toResponse(created);
        });
    }
    migrateLegacyFallbackIfNeeded(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!doc)
                return;
            const coordinates = Array.isArray((_a = doc.location) === null || _a === void 0 ? void 0 : _a.coordinates)
                ? doc.location.coordinates
                : null;
            const isLegacyAddress = this.normalizeText(doc.street).toLowerCase() === "fashion street 1" &&
                this.normalizeText(doc.city).toLowerCase() === "phnom penh";
            const isLegacyCoordinates = Array.isArray(coordinates) &&
                coordinates.length === 2 &&
                Math.abs(Number(coordinates[0]) - this.legacyFallbackCoordinates[0]) <
                    0.000001 &&
                Math.abs(Number(coordinates[1]) - this.legacyFallbackCoordinates[1]) <
                    0.000001;
            if (!isLegacyAddress && !isLegacyCoordinates) {
                return;
            }
            doc.label = this.defaultShop.label;
            doc.street = this.defaultShop.street;
            doc.city = this.defaultShop.city;
            doc.state = this.defaultShop.state;
            doc.postalCode = this.defaultShop.postalCode;
            doc.country = this.defaultShop.country;
            doc.location = this.defaultShop.location;
            doc.isDefault = true;
            doc.isActive = true;
            yield doc.save();
        });
    }
    getDefaultShopAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield this.model
                .findOne({ isActive: true, isDefault: true })
                .sort({ updatedAt: -1 })
                .exec();
            if (!doc) {
                doc = yield this.model
                    .findOne({ isActive: true })
                    .sort({ updatedAt: -1 })
                    .exec();
            }
            if (!doc) {
                return this.createFallbackDefault();
            }
            yield this.migrateLegacyFallbackIfNeeded(doc);
            if (!doc.isDefault) {
                yield this.model.updateMany({ _id: { $ne: doc._id } }, { isDefault: false });
                doc.isDefault = true;
                yield doc.save();
            }
            return this.toResponse(doc);
        });
    }
    listShopAddresses() {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = yield this.model
                .find({ isActive: true })
                .sort({ isDefault: -1, updatedAt: -1 })
                .exec();
            if (docs.length === 0) {
                return [yield this.createFallbackDefault()];
            }
            return docs.map((doc) => this.toResponse(doc));
        });
    }
    upsertDefaultShopAddress(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertPayload(payload);
            const coordinates = this.parseCoordinates(payload.location);
            const defaultDoc = yield this.model
                .findOne({ isActive: true, isDefault: true })
                .exec();
            yield this.model.updateMany({ _id: { $ne: defaultDoc === null || defaultDoc === void 0 ? void 0 : defaultDoc._id } }, { isDefault: false });
            if (defaultDoc) {
                defaultDoc.label = this.normalizeText(payload.label, defaultDoc.label);
                defaultDoc.street = this.normalizeText(payload.street);
                defaultDoc.city = this.normalizeText(payload.city);
                defaultDoc.state = this.normalizeText(payload.state);
                defaultDoc.postalCode = this.normalizeText(payload.postalCode);
                defaultDoc.country = this.normalizeText(payload.country, "Cambodia");
                defaultDoc.location = { type: "Point", coordinates };
                defaultDoc.isDefault = true;
                defaultDoc.isActive = true;
                yield defaultDoc.save();
                return this.toResponse(defaultDoc);
            }
            const created = yield this.model.create({
                label: this.normalizeText(payload.label, this.defaultShop.label),
                street: this.normalizeText(payload.street),
                city: this.normalizeText(payload.city),
                state: this.normalizeText(payload.state),
                postalCode: this.normalizeText(payload.postalCode),
                country: this.normalizeText(payload.country, this.defaultShop.country),
                location: { type: "Point", coordinates },
                isDefault: true,
                isActive: true,
            });
            return this.toResponse(created);
        });
    }
}
exports.default = ShopAddressServiceImpl;
