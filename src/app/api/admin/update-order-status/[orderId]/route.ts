import connectDb from "@/lib/db";
import { DeliveryAssignment } from "@/models/deliveryAssigment.model";
import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

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
        let DeliveryBoysPayload: any = [];
        if (status === "out for delivery" && !order.assigment ) {
            const {langitude, latitude} = order.address;
            const nearByDelevieryBoys = await User.find({
                role: "deliveryBoy",
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [langitude, latitude]
                        },
                        $maxDistance: 5000 // 5 km radius
                    }
                }
            });
            const nearByIds = nearByDelevieryBoys.map((boy) => boy._id);
            const busyIds = await DeliveryAssignment.find({
                assignedTo: {$in: nearByIds},
                status: {$nin: ["broadcasted", "completed"]}
            }).distinct("assignedTo")
            const busyIdSet = new Set(busyIds.map(b=>String(b)))
            const availableDeliveryBoys = nearByDelevieryBoys.filter(b => !busyIdSet.has(String(b._id)))
            const candidates = availableDeliveryBoys.map(b=>b._id)
            if (candidates.length) {
                await order.save()
                return NextResponse.json(
                    {message: "There is not any deleviery boys available."}
                    {status: 200}
                )
            }
            const deliveryAssigment = await DeliveryAssignment.create({
                order: order._id,
                broadcastedTo: candidates,
                status: "broadcasted"
            })
            order.assigment = deliveryAssigment._id,
            order.assignedDeliveryBoy = deliveryAssigment.assignedTo
        }

        }  
      } catch (error) {
        
    }
}