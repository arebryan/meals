import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({
      ok: true,
      service: "meals",
      db: "up",
      time: new Date().toISOString(),
    });
  } catch {
    // Do not leak driver/connection details to anonymous clients.
    return NextResponse.json(
      {
        ok: false,
        service: "meals",
        db: "down",
        time: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
