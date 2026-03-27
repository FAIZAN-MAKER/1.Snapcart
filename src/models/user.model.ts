import mongoose from "mongoose";

interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  mobile?: string;
  role: "admin" | "user" | "deliveryBoy";
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: false },
  role: {
    type: String,
    enum: ["admin", "user", "deliveryBoy"],
    default: "user",
  },
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
