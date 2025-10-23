import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import OrderModel from '@/lib/models/Order';
import { isValidObjectId } from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    if (!isValidObjectId(id))
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const order = await OrderModel.findById(id).lean();
    if (!order)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json(order, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
