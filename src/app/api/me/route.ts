import { auth } from "@/auth";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email }).select(
      "-password",
    );

    if (!user) {
      return NextResponse.json("User not found", { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
