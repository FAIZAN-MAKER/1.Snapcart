import mongoose from "mongoose";

interface IOrder {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: Array<{
    grocery: mongoose.Types.ObjectId;
    quantity: number;
    name: string;
    price: string;
    image: string;
    unit: string;
  }>;
  totalAmount: string;
  paymentMethod: "cod" | "online";
  address: {
    fullName: string;
    mobile: string;
    city: string;
    state: string;
    pinCode: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
  };
  status: "pending" | "out for delivery" | "delivered";
  createdAt?: Date;
  updatedAt?: Date;
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        grocery: {
          type: mongoose.Types.ObjectId,
          ref: "Grocery",
          required: true,
        },
        quantity: { type: Number, required: true },
        name: { type: String, required: true },
        price: { type: String, required: true },
        image: { type: String, required: true },
        unit: { type: String, required: true },
      },
    ],
    totalAmount: { type: String, required: true },
    paymentMethod: { type: String, enum: ["cod", "online"], required: true },
    address: {
      fullName: { type: String, required: true },
      mobile: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pinCode: { type: String, required: true },
      fullAddress: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "out for delivery", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
