// lib/models/User.ts
import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

// ✅ Avoid the complex union by branching first, then casting once.
const UserModel =
  (models.User as Model<UserDoc> | undefined) ?? model<UserDoc>('User', UserSchema);

export default UserModel;
