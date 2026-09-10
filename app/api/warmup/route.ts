import { NextResponse } from "next/server";
import { withDbRetry } from "@/lib/db/prisma";

export async function GET() {
    try {
        await withDbRetry((db) => db.user.findFirst({ select: { id: true } }), 2, 1000);
        return NextResponse.json({ status: "ready" });
    } catch (err) {
        console.warn("[Warmup] DB warm-up warning:", err);
        return NextResponse.json({ status: "warming" }, { status: 503 });
    }
}
