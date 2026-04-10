import connectDb from "@/lib/db";
import { Order } from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature")!;
  const rawBody = await request.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    console.error("Webhook signature verification failed.", error);
    return new NextResponse("Webhook Error: Invalid signature", {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session?.metadata?.orderId;

    if (orderId) {
      await connectDb();
      await Order.findOneAndUpdate(
        { _id: orderId },
        { $set: { isPaid: true } },
      );
    }
  }

  return new NextResponse("Event received", { status: 200 });
}
