import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/server/auth";
import crypto from "crypto";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    const user = await User.create({
      _id: userId,
      name,
      email,
      passwordHash,
      passwordSetAt: new Date(),
      authProvider: "local",
      role: "guest",
      approved: true,
      emailVerified: false,
    });

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
