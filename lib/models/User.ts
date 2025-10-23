// lib/models/User.ts
import { Schema, model, type Model, type InferSchemaType } from 'mongoose';

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

// ✅ Avoid models.User union entirely; reuse compiled model if it exists.
let UserModel: Model<UserDoc>;
try {
  // If the model is already compiled (dev/HMR), this succeeds.
  UserModel = model<UserDoc>('User');
} catch {
  // Otherwise, compile it once.
  UserModel = model<UserDoc>('User', UserSchema);
}

export default UserModel;
