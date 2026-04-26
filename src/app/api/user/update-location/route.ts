import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { User } from "@/models/user.model";
import connectDb from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { latitude, longitude } = await req.json();

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    await connectDb();

    await User.findByIdAndUpdate(session.user.id, {
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}