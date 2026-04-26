import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { User } from "@/models/user.model";
import { io } from "socket.io-client";

const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4000";

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
      return NextResponse.json({ message: "Only delivery boys can accept orders" }, { status: 403 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (order.status !== "out for delivery") {
      return NextResponse.json({ message: "Order is not available for delivery" }, { status: 400 });
    }

    order.assignedDeliveryBoy = deliveryBoy._id;
    order.status = "accepted";
    await order.save();

    try {
      const socket = io(socketServerUrl, { autoConnect: false });
      socket.connect();
      socket.emit("order-status-update", {
        orderId,
        status: "accepted",
        userId: order.user?.toString(),
      });
      socket.emit("order-accepted", {
        orderId,
        deliveryBoy: {
          _id: deliveryBoy._id,
          name: deliveryBoy.name,
          email: deliveryBoy.email,
          mobile: deliveryBoy.mobile,
          image: deliveryBoy.image,
        },
        userId: order.user?.toString(),
      });
      socket.disconnect();
    } catch (socketErr) {
      console.error("Socket emission error:", socketErr);
    }

    return NextResponse.json({ 
      message: "Order accepted successfully", 
      order: {
        _id: order._id,
        status: order.status,
        assignedDeliveryBoy: deliveryBoy._id,
        deliveryBoy: {
          name: deliveryBoy.name,
          image: deliveryBoy.image,
        }
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error accepting order:", error);
    return NextResponse.json({ message: "Failed to accept order" }, { status: 500 });
  }
}