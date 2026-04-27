import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { User } from "@/models/user.model";
import connectDb from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", data: null }, { status: 401 });
    }

    const { latitude, longitude } = await req.json();

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ success: false, message: "Invalid coordinates", data: null }, { status: 400 });
    }

    await connectDb();

    await User.findByIdAndUpdate(session.user.id, {
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    return NextResponse.json({ success: true, message: "Location updated successfully", data: null }, { status: 200 });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json({ success: false, message: "Failed to update location", data: null }, { status: 500 });
  }
}