import { Schema, model, type Model, type InferSchemaType } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    price: { type: Number, required: true },
    sizes: [String],
    colors: [String],
    fabric: String,
    quantity: { type: Number, default: 0 },
    product_details: String,
    images: [String],
  },
  { timestamps: true }
);

export type ProductDoc = InferSchemaType<typeof ProductSchema>;

// ✅ Avoid complex union by using try/catch model reuse
let ProductModel: Model<ProductDoc>;
try {
  ProductModel = model<ProductDoc>("Product");
} catch {
  ProductModel = model<ProductDoc>("Product", ProductSchema);
}

export default ProductModel;
