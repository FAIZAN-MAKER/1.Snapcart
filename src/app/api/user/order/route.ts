import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const {userId, items, totalAmount, paymentMethod, address} = await request.json();
    if (!userId || !items || !totalAmount || !paymentMethod || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newOrder = await Order.create({
      user: userId,
      items,
      totalAmount,
      paymentMethod,
      address
    });

    return NextResponse.json({ order: newOrder }, { status: 201 });

  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
