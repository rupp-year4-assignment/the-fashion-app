import {
  AddressType,
  AddressLocationDTO,
  AddressResponseDTO,
  CreateAddressDTO,
  UpdateAddressDTO,
} from "@dtos/request/address.request";
import BadRequestException from "@exceptions/badRequest.exception";
import NotFoundException from "@exceptions/notFound.exception";
import UserModel from "@models/user";
import { AddressService } from "@services/address.service";
import { ObjectId, Types } from "mongoose";

type AddressDocument = {
  id?: string;
  _id?: string;
  addressType?: string;
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  zip?: string;
  country?: string;
  isDefault?: boolean;
  isDefualt?: boolean;
  location?: any;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

class AddressServiceImpl implements AddressService {
  private userModel = UserModel.getModel();

  private normalizeAddressType(value: unknown): AddressType {
    const normalized = this.normalizeText(value, "USER_DELIVERY").toUpperCase();
    if (normalized === "SHOP_ORIGIN") {
      return "SHOP_ORIGIN";
    }
    return "USER_DELIVERY";
  }

  private normalizeText(value: unknown, fallback = ""): string {
    if (typeof value !== "string") {
      return fallback;
    }
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : fallback;
  }

  private parseCoordinates(
    location: any
  ): { coordinates: [number, number]; type: "Point" } {
    if (!location || typeof location !== "object") {
      throw new BadRequestException("Location is required.");
    }

    const rawType = this.normalizeText(location.type, "Point").toUpperCase();
    if (rawType !== "POINT") {
      throw new BadRequestException("Location type must be Point.");
    }

    const rawCoordinates = location.coordinates;
    if (
      !Array.isArray(rawCoordinates) ||
      rawCoordinates.length !== 2 ||
      !Number.isFinite(Number(rawCoordinates[0])) ||
      !Number.isFinite(Number(rawCoordinates[1]))
    ) {
      throw new BadRequestException(
        "Location coordinates must be [longitude, latitude]."
      );
    }

    const lng = Number(rawCoordinates[0]);
    const lat = Number(rawCoordinates[1]);

    if (lng < -180 || lng > 180) {
      throw new BadRequestException("Longitude must be between -180 and 180.");
    }
    if (lat < -90 || lat > 90) {
      throw new BadRequestException("Latitude must be between -90 and 90.");
    }

    return { type: "Point", coordinates: [lng, lat] };
  }

  private normalizeLocationForResponse(value: any): AddressLocationDTO {
    if (value && typeof value === "object") {
      const coordinates = value.coordinates;
      if (
        Array.isArray(coordinates) &&
        coordinates.length === 2 &&
        Number.isFinite(Number(coordinates[0])) &&
        Number.isFinite(Number(coordinates[1]))
      ) {
        return {
          type: "Point",
          coordinates: [Number(coordinates[0]), Number(coordinates[1])],
        };
      }
    }

    return { type: "Point", coordinates: [104.9282, 11.5564] };
  }

  private toResponse(address: AddressDocument): AddressResponseDTO {
    const location = this.normalizeLocationForResponse(address.location);

    const createdAt =
      address.createdAt != null ? new Date(address.createdAt) : new Date();
    const updatedAt =
      address.updatedAt != null ? new Date(address.updatedAt) : createdAt;

    return {
      id: String(address.id ?? address._id ?? ""),
      addressType: this.normalizeAddressType(address.addressType),
      label: this.normalizeText(address.label, "Home"),
      street: this.normalizeText(address.street),
      city: this.normalizeText(address.city),
      state: this.normalizeText(address.state),
      postalCode: this.normalizeText(address.postalCode ?? address.zip),
      country: this.normalizeText(address.country, "Cambodia"),
      location,
      isDefault: Boolean(address.isDefault ?? address.isDefualt ?? false),
      createdAt,
      updatedAt,
    };
  }

  private ensureRequiredAddressFields(payload: CreateAddressDTO): void {
    if (!this.normalizeText(payload.street)) {
      throw new BadRequestException("Street is required.");
    }
    if (!this.normalizeText(payload.city)) {
      throw new BadRequestException("City is required.");
    }
    if (!this.normalizeText(payload.state)) {
      throw new BadRequestException("State is required.");
    }
    if (!this.normalizeText(payload.postalCode)) {
      throw new BadRequestException("Postal code is required.");
    }
    if (!this.normalizeText(payload.country)) {
      throw new BadRequestException("Country is required.");
    }
  }

  private async getUserDocument(userId: ObjectId): Promise<any> {
    const user = await this.userModel.findById(
      new Types.ObjectId(userId.toString())
    );
    if (!user) {
      throw new NotFoundException("User not found.");
    }
    return user;
  }

  private extractAddresses(user: any): AddressDocument[] {
    if (!Array.isArray(user.addresses)) {
      return [];
    }
    return [...(user.addresses as AddressDocument[])];
  }

  private ensureOneDefault(addresses: AddressDocument[]): AddressDocument[] {
    if (addresses.length === 0) {
      return addresses;
    }

    const hasDefault = addresses.some(
      (item) => item.isDefault === true || item.isDefualt === true
    );

    if (!hasDefault) {
      addresses[0].isDefault = true;
      addresses[0].isDefualt = false;
    }

    return addresses;
  }

  async getAddressesByUser(userId: ObjectId): Promise<AddressResponseDTO[]> {
    const user = await this.userModel
      .findById(new Types.ObjectId(userId.toString()))
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    const addresses = Array.isArray(user.addresses) ? user.addresses : [];

    const normalized = addresses
      .map((address: any) => this.toResponse(address))
      .filter((address) => address.addressType === "USER_DELIVERY")
      .sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

    return normalized;
  }

  async addAddress(
    userId: ObjectId,
    payload: CreateAddressDTO
  ): Promise<AddressResponseDTO> {
    this.ensureRequiredAddressFields(payload);
    const location = this.parseCoordinates(payload.location);

    const user = await this.getUserDocument(userId);
    const addresses = this.extractAddresses(user);

    const now = new Date();
    const created: AddressDocument = {
      id: new Types.ObjectId().toString(),
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
    await user.save();

    return this.toResponse(created);
  }

  async updateAddress(
    userId: ObjectId,
    addressId: string,
    payload: UpdateAddressDTO
  ): Promise<AddressResponseDTO> {
    const user = await this.getUserDocument(userId);
    const addresses = this.extractAddresses(user);

    const index = addresses.findIndex((item) => {
      const id = String(item.id ?? item._id ?? "");
      return id === addressId;
    });

    if (index < 0) {
      throw new NotFoundException("Address not found.");
    }

    const existing = { ...addresses[index] };

    if (payload.label != null) {
      existing.label = this.normalizeText(payload.label, existing.label ?? "Home");
    }
    if (payload.addressType != null) {
      const type = this.normalizeAddressType(payload.addressType);
      if (type !== "USER_DELIVERY") {
        throw new BadRequestException(
          "User address book only supports USER_DELIVERY address type."
        );
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
      existing.postalCode = this.normalizeText(
        payload.postalCode,
        existing.postalCode ?? existing.zip
      );
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
    await user.save();

    return this.toResponse(addresses[index]);
  }

  async removeAddress(userId: ObjectId, addressId: string): Promise<void> {
    const user = await this.getUserDocument(userId);
    const addresses = this.extractAddresses(user);

    const index = addresses.findIndex((item) => {
      const id = String(item.id ?? item._id ?? "");
      return id === addressId;
    });

    if (index < 0) {
      throw new NotFoundException("Address not found.");
    }

    addresses.splice(index, 1);
    user.addresses = this.ensureOneDefault(addresses);
    await user.save();
  }

  async setDefaultAddress(
    userId: ObjectId,
    addressId: string
  ): Promise<AddressResponseDTO> {
    const user = await this.getUserDocument(userId);
    const addresses = this.extractAddresses(user);

    let found = false;
    const now = new Date();

    for (const address of addresses) {
      const id = String(address.id ?? address._id ?? "");
      const isDefault = id === addressId;
      if (isDefault) {
        found = true;
      }
      address.isDefault = isDefault;
      address.isDefualt = isDefault;
      address.updatedAt = now;
    }

    if (!found) {
      throw new NotFoundException("Address not found.");
    }

    user.addresses = this.ensureOneDefault(addresses);
    await user.save();

    const selected = addresses.find(
      (item) => String(item.id ?? item._id ?? "") === addressId
    )!;

    return this.toResponse(selected);
  }
}

export default AddressServiceImpl;
