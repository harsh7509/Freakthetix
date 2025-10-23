// app/api/health/db/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { dbConnect } from "@/lib/db";
import mongoose from "mongoose";

export async function GET() {
  try {
    const client = await clientPromise;           // adapter client
    const ping = await client.db().admin().ping();

    const conn = await dbConnect();               // mongoose
    const ready = mongoose.connection.readyState; // 1 = connected
    const dbName = conn?.connection?.db?.databaseName || "";

    return NextResponse.json({
      adapter: { ok: true, ping },
      mongoose: { ok: ready === 1, readyState: ready, dbName },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
