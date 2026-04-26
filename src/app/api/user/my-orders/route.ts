import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        
        if (!session?.user?.email) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const orders = await Order.find({ user: session.user.id })
            .populate("user")
            .populate("assignedDeliveryBoy", "name email image mobile")
            .sort({ createdAt: -1 });
        
        return new Response(JSON.stringify(orders), { status: 200 });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return new Response(JSON.stringify({ message: "Failed to fetch orders" }), { status: 500 });
    }
}