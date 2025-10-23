import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import ProductModel, { type ProductDoc } from "@/lib/models/Product";

export async function GET() {
  await dbConnect();
  const products = await ProductModel.find().sort({ createdAt: -1 }).lean<ProductDoc[]>();
  const data = products.map((p: any) => ({
    ...p,
    _id: String(p._id),
    createdAt: p.createdAt?.toISOString?.() ?? "",
    updatedAt: p.updatedAt?.toISOString?.() ?? "",
  }));
  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  if (!body?.name || typeof body?.price !== "number") {
    return NextResponse.json({ error: "name & price are required" }, { status: 400 });
  }

  if (!body.slug) {
    body.slug = String(body.name)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  const doc = await ProductModel.create({
    name: body.name,
    slug: body.slug,
    description: body.description || "",
    price: body.price,
    sizes: body.sizes || [],
    colors: body.colors || [],
    fabric: body.fabric || "",
    quantity: body.quantity ?? 0,
    product_details: body.product_details || "",
    images: body.images || [],
  });

  return NextResponse.json({ ok: true, id: String(doc._id) }, { status: 201 });
}
