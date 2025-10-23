import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import OrderModel from "@/lib/models/Order";

// zod validation (optional but helpful)
const itemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  qty: z.number().int().positive(),
});

const bodySchema = z.object({
  items: z.array(itemSchema).min(1),
  amount: z.number().nonnegative(),
  address: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(8),
    line1: z.string().min(5),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
  }),
  paymentMethod: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // 🔐 Read JWT from NextAuth (no custom auth() needed)
    // NOTE: make sure NEXTAUTH_SECRET is set in your environment.
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = (token?.uid as string) || null; // we set token.uid in your NextAuth jwt callback
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message || "Invalid body";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { items, amount, address, paymentMethod } = parsed.data;

    const order = await OrderModel.create({
      userId,
      items,
      amount,
      status: "pending",
      address,
      meta: { paymentMethod },
    });

    return NextResponse.json({ ok: true, orderId: String(order._id) }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Order create error" }, { status: 500 });
  }
}
