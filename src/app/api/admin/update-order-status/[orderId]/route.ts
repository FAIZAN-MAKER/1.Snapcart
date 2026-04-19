import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
    try {
        await connectDb();
        const { orderId } = params;
        const { status } = await req.json();
        const order = await Order.findById(orderId).populate("user");
        if (!order) {
            return new Response(JSON.stringify({ message: "Order not found" }), { status: 404 });
        }
        order.status = status;
        let availableDeliveryBoys = [];
        if (status === "out for delivery" && !order.assigment ) {
            
        }  
      } catch (error) {
        
    }
}