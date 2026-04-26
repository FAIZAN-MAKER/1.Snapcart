import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { User } from "@/models/user.model";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    
    console.log("Session:", session?.user);
    
    // Return available + accepted orders for now
    const orders = await Order.find({
      $or: [
        { status: "out for delivery" },
        { status: "accepted" },
      ]
    })
      .populate("user")
      .populate("assignedDeliveryBoy", "name email image mobile")
      .sort({ createdAt: -1 });
    
    console.log("Found orders:", orders.length, orders.map((o: any) => ({ id: o._id, status: o.status })));
    
    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error) {
    console.error("Error fetching delivery orders:", error);
    return new Response(JSON.stringify({ message: "Failed to fetch orders" }), { status: 500 });
  }
}