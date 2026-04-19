import connectDb from "@/lib/db";
import { User } from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        await connectDb();
        const { userId, socketId } = await request.json();
        const user = await User.findByIdAndUpdate(userId, { socketId, isOnline: true }, { new: true });
        if (!user) {
            return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
        }
        return new Response(JSON.stringify({ message: "Socket ID updated", user }), { status: 200 });
    } catch (error) {
        console.error("Error updating socket ID:", error);
        return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}
