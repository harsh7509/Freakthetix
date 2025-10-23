import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import UserModel from '@/lib/models/User';

const bodySchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const parsed = bodySchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    await dbConnect();
    const email = String(parsed.data.email).toLowerCase().trim();
    const exists = await UserModel.findOne({ email }).lean();
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const hash = await bcrypt.hash(parsed.data.password, 10);
    await UserModel.create({
      name: parsed.data.name,
      email,
      passwordHash: hash,
      role: 'user',
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Signup error' }, { status: 500 });
  }
}
