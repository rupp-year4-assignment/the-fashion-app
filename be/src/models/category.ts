import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

class CategoryModel {
  private model: Model<ICategory>;

  constructor() {
    this.model = mongoose.model<ICategory>(
      "categories",
      new Schema<ICategory>(
        {
          name: { type: String, required: true, unique: true, trim: true },
          slug: { type: String, required: true, unique: true, trim: true },
          description: { type: String, default: "", trim: true },
          status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
            required: true,
          },
        },
        { timestamps: true },
      ),
    );
  }

  getModel(): Model<ICategory> {
    return this.model;
  }
}

export default new CategoryModel();
