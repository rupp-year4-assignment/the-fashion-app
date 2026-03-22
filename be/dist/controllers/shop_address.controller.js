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
class ShopAddressController {
    constructor(shopAddressService) {
        this.shopAddressService = shopAddressService;
        this.getDefaultShopAddress = this.getDefaultShopAddress.bind(this);
        this.listShopAddresses = this.listShopAddresses.bind(this);
        this.upsertDefaultShopAddress = this.upsertDefaultShopAddress.bind(this);
    }
    getDefaultShopAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.shopAddressService.getDefaultShopAddress();
            res.status(200).json({
                success: true,
                message: "Default shop address fetched successfully",
                data,
            });
        });
    }
    listShopAddresses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.shopAddressService.listShopAddresses();
            res.status(200).json({
                success: true,
                message: "Shop addresses fetched successfully",
                data,
            });
        });
    }
    upsertDefaultShopAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.shopAddressService.upsertDefaultShopAddress(req.body);
            res.status(200).json({
                success: true,
                message: "Default shop address saved successfully",
                data,
            });
        });
    }
}
exports.default = ShopAddressController;
