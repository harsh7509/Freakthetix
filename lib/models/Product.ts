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
// _id:ObjectId; createdAt:Date; updatedAt:Date …

export default (models.Product as Model<ProductDoc>) || model<ProductDoc>("Product", ProductSchema);
