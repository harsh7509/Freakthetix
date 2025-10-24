import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const OrderSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        qty: Number,
        color: String,
      },
    ],
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled'],
      default: 'pending',
    },
    cf_order_id: String,
    address: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export type OrderDoc = InferSchemaType<typeof OrderSchema>;

const OrderModel =
  (models.Order as Model<OrderDoc> | undefined) ??
  model<OrderDoc>('Order', OrderSchema);

export default OrderModel;
