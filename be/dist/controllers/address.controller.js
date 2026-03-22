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
class AddressController {
    constructor(addressService) {
        this.addressService = addressService;
        this.getAddresses = this.getAddresses.bind(this);
        this.addAddress = this.addAddress.bind(this);
        this.updateAddress = this.updateAddress.bind(this);
        this.removeAddress = this.removeAddress.bind(this);
        this.setDefaultAddress = this.setDefaultAddress.bind(this);
    }
    getAddresses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const data = yield this.addressService.getAddressesByUser(user._id);
            res.status(200).json({
                success: true,
                message: "Addresses fetched successfully",
                data,
            });
        });
    }
    addAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const data = yield this.addressService.addAddress(user._id, req.body);
            res.status(201).json({
                success: true,
                message: "Address created successfully",
                data,
            });
        });
    }
    updateAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const addressId = req.params.addressId;
            const data = yield this.addressService.updateAddress(user._id, addressId, req.body);
            res.status(200).json({
                success: true,
                message: "Address updated successfully",
                data,
            });
        });
    }
    removeAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const addressId = req.params.addressId;
            yield this.addressService.removeAddress(user._id, addressId);
            res.status(200).json({
                success: true,
                message: "Address removed successfully",
            });
        });
    }
    setDefaultAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const addressId = req.params.addressId;
            const data = yield this.addressService.setDefaultAddress(user._id, addressId);
            res.status(200).json({
                success: true,
                message: "Default address updated successfully",
                data,
            });
        });
    }
}
exports.default = AddressController;
