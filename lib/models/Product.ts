import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

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

// ✅ Avoid complex inline union: branch first, then export once.
const ProductModel =
  (models.Product as Model<ProductDoc> | undefined) ??
  model<ProductDoc>("Product", ProductSchema);

export default ProductModel;
