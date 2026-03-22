import {
  ShopAddressResponseDTO,
  UpsertShopAddressDTO,
} from "@dtos/request/shop_address.request";
import BadRequestException from "@exceptions/badRequest.exception";
import ShopAddressModel from "@models/shop_address";
import { ShopAddressService } from "@services/shop_address.service";

class ShopAddressServiceImpl implements ShopAddressService {
  private model = ShopAddressModel.getModel();
  private readonly defaultShop = {
    label: "Main Shop",
    street: "Angk Snuol",
    city: "Angk Snuol",
    state: "Kandal",
    postalCode: "120904",
    country: "Cambodia",
    location: {
      type: "Point" as const,
      coordinates: [104.713525, 11.568267] as [number, number],
    },
  };
  private readonly legacyFallbackCoordinates: [number, number] = [
    104.9282,
    11.5564,
  ];

  private normalizeText(value: unknown, fallback = ""): string {
    if (typeof value !== "string") {
      return fallback;
    }
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : fallback;
  }

  private parseCoordinates(location: any): [number, number] {
    if (!location || typeof location !== "object") {
      throw new BadRequestException("Location is required.");
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

    return [lng, lat];
  }

  private assertPayload(payload: UpsertShopAddressDTO): void {
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

  private toResponse(doc: any): ShopAddressResponseDTO {
    const coordinates = Array.isArray(doc.location?.coordinates)
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

  private async createFallbackDefault(): Promise<ShopAddressResponseDTO> {
    const created = await this.model.create({
      ...this.defaultShop,
      isDefault: true,
      isActive: true,
    } as any);

    return this.toResponse(created);
  }

  private async migrateLegacyFallbackIfNeeded(doc: any): Promise<void> {
    if (!doc) return;

    const coordinates = Array.isArray(doc.location?.coordinates)
      ? doc.location.coordinates
      : null;

    const isLegacyAddress =
      this.normalizeText(doc.street).toLowerCase() === "fashion street 1" &&
      this.normalizeText(doc.city).toLowerCase() === "phnom penh";

    const isLegacyCoordinates =
      Array.isArray(coordinates) &&
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
    await doc.save();
  }

  async getDefaultShopAddress(): Promise<ShopAddressResponseDTO> {
    let doc = await this.model
      .findOne({ isActive: true, isDefault: true } as any)
      .sort({ updatedAt: -1 })
      .exec();

    if (!doc) {
      doc = await this.model
        .findOne({ isActive: true } as any)
        .sort({ updatedAt: -1 })
        .exec();
    }

    if (!doc) {
      return this.createFallbackDefault();
    }

    await this.migrateLegacyFallbackIfNeeded(doc);

    if (!doc.isDefault) {
      await this.model.updateMany(
        { _id: { $ne: doc._id } } as any,
        { isDefault: false } as any
      );
      doc.isDefault = true;
      await doc.save();
    }

    return this.toResponse(doc);
  }

  async listShopAddresses(): Promise<ShopAddressResponseDTO[]> {
    const docs = await this.model
      .find({ isActive: true } as any)
      .sort({ isDefault: -1, updatedAt: -1 })
      .exec();

    if (docs.length === 0) {
      return [await this.createFallbackDefault()];
    }

    return docs.map((doc) => this.toResponse(doc));
  }

  async upsertDefaultShopAddress(
    payload: UpsertShopAddressDTO
  ): Promise<ShopAddressResponseDTO> {
    this.assertPayload(payload);
    const coordinates = this.parseCoordinates(payload.location);

    const defaultDoc = await this.model
      .findOne({ isActive: true, isDefault: true } as any)
      .exec();

    await this.model.updateMany(
      { _id: { $ne: defaultDoc?._id } } as any,
      { isDefault: false } as any
    );

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
      await defaultDoc.save();
      return this.toResponse(defaultDoc);
    }

    const created = await this.model.create({
      label: this.normalizeText(payload.label, this.defaultShop.label),
      street: this.normalizeText(payload.street),
      city: this.normalizeText(payload.city),
      state: this.normalizeText(payload.state),
      postalCode: this.normalizeText(payload.postalCode),
      country: this.normalizeText(payload.country, this.defaultShop.country),
      location: { type: "Point", coordinates },
      isDefault: true,
      isActive: true,
    } as any);

    return this.toResponse(created);
  }
}

export default ShopAddressServiceImpl;
