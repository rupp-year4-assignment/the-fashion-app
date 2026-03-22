import mongoose, { Model, ObjectId } from "mongoose";

export interface IUserToken extends Document {
  tokenHash: string;
  expiredAt: Date;
  userId: ObjectId;
}

class UserToken {
  private model: Model<IUserToken>;

  constructor() {
    this.model = mongoose.model<IUserToken>(
      "UserToken",
      new mongoose.Schema(
        {
          tokenHash: { type: String, required: true },
          expiredAt: { type: Date, required: true },
          userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        },
        { timestamps: true }
      )
    );
  }

  public getModel(): Model<IUserToken> {
    return this.model;
  }
}

export default new UserToken();
