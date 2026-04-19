import mongoose from "mongoose";

interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "admin" | "user" | "deliveryBoy";
  image?: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  socketId: string;
  isOnline: boolean;
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  mobile: { type: String, required: false },
  role: {
    type: String,
    enum: ["admin", "user", "deliveryBoy"],
    default: "user",
  },
  image: { type: String, required: false },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
  socketId: { type: String, default: null },
  isOnline: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.index({ location: "2dsphere" });


export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
