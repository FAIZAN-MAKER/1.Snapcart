import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { User } from "@/models/user.model";

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    await connectDb();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    const deliveryBoy = await User.findOne({ 
      email: session.user.email, 
      role: { $in: ["delivery boy", "deliveryBoy"] }
    });
    
    if (!deliveryBoy) {
      return NextResponse.json({ message: "Only delivery boys can reject orders" }, { status: 403 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Rejecting means the order goes back to pending for another delivery boy
    order.assignedDeliveryBoy = null;
    order.status = "pending";
    await order.save();

    return NextResponse.json({ 
      message: "Order rejected successfully", 
      order: {
        _id: order._id,
        status: order.status,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error rejecting order:", error);
    return NextResponse.json({ message: "Failed to reject order" }, { status: 500 });
  }
}