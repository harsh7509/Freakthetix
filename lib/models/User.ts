import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const UserSchema = new Schema({
  name:        { type: String },
  email:       { type: String, required: true, unique: true },
  
  passwordHash:{ type: String, required: true },
  role:        { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

export type UserDoc = InferSchemaType<typeof UserSchema>; // { name?:string; email:string; passwordHash:string; role:'user'|'admin' }

export default (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);
