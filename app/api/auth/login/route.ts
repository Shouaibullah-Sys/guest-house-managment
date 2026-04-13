import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { verifyPassword, generateToken, setAuthCookie } from "@/lib/server/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = loginSchema.parse(body);

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = await generateToken(
      user._id,
      rememberMe,
      user.role,
      user.approved
    );
    await setAuthCookie(token, rememberMe);

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
