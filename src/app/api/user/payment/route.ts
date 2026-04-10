import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    await connectDb();

    const { userId, items, totalAmount, address } = await request.json();

    if (!userId || !items || !totalAmount || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create a pending order in DB first so we have an orderId for the webhook
    const newOrder = await Order.create({
      user: userId,
      items,
      totalAmount,
      paymentMethod: "online",
      address,
      status: "pending",
    });

    // 2. Build Stripe line items
    const lineItems = items.map((item: {
      name: string; price: string; quantity: number; image: string;
    }) => ({
      price_data: {
        currency: "pkr",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(parseFloat(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata: {
        orderId: newOrder._id.toString(), // webhook reads this to mark order as paid
      },
      success_url: `${process.env.NEXT_BASE_URL}/user/order-success?orderId=${newOrder._id}`,
      cancel_url: `${process.env.NEXT_BASE_URL}/user/checkout?cancelled=true`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });

  } catch (error) {
    console.error("[Stripe Payment API]", error);
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 });
  }
}
