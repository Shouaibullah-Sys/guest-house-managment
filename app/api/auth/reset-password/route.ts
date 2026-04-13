import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword, verifyPassword } from "@/lib/server/auth";

const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    await dbConnect();

    const user = await User.findOne({
      resetTokenExpiresAt: { $gt: new Date() },
    });

    if (!user || !user.resetTokenHash) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const isTokenValid = await verifyPassword(token, user.resetTokenHash);
    if (!isTokenValid) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    user.passwordHash = await hashPassword(password);
    user.passwordSetAt = new Date();
    user.resetTokenHash = undefined;
    user.resetTokenExpiresAt = undefined;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
