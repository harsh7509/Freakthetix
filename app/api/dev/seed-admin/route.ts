import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import UserModel from "@/lib/models/User";

// Simple helper
async function createAdmin(email: string, password: string, name = "Main Admin") {
  await dbConnect();

  const exists = await UserModel.findOne({ email });
  if (exists) {
    return NextResponse.json(
      { ok: true, message: "User already exists", email: exists.email },
      { status: 200 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await UserModel.create({
    name,
    email,
    passwordHash,
    role: "admin",
  });

  return NextResponse.json(
    {
      ok: true,
      message: "Admin created successfully",
      email: admin.email,
    },
    { status: 201 }
  );
}

// ✅ GET version (easy to use from browser)
export async function GET() {
  // Defaults you can change:
  const email = "admin@freakthetix.com";
  const password = "Admin@123";
  return createAdmin(email, password, "Main Admin");
}

// ✅ POST version (for curl / scripts)
export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "email & password required" }, { status: 400 });
  }
  return createAdmin(email, password, name || "Main Admin");
}
