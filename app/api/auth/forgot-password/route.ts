import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/server/auth";
import { sendPasswordResetEmail } from "@/lib/server/email";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    await dbConnect();
    const user = await User.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = await hashPassword(resetToken);

      user.resetTokenHash = resetTokenHash;
      user.resetTokenExpiresAt = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      try {
        await sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        console.error("Failed to send reset email:", emailError);
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ success: true });
  }
}
