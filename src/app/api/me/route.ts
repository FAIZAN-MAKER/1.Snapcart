import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized", data: null }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email }).select(
      "-password",
    );

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found", data: null }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User fetched successfully", data: { user } }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error", data: null }, { status: 500 });
  }
}
