import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import ProductModel from "@/lib/models/Product";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();
    const product = await ProductModel.findOne({ slug: params.slug }).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      _id: String(product._id),
      createdAt: product.createdAt?.toISOString?.() ?? "",
      updatedAt: product.updatedAt?.toISOString?.() ?? "",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
