import { NextResponse } from "next/server";
import { withDbRetry } from "@/lib/db/prisma";

// Tell Vercel this function can run up to 30 seconds (requires Pro for >10s)
// On Hobby plan this is capped at 10s — but every ms saved helps.
export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await withDbRetry(
            (db) => db.$queryRaw`SELECT 1`,
            1,   // only 1 retry for warmup
            500
        );
        return NextResponse.json({ status: "ready" });
    } catch (err) {
        console.warn("[Warmup] DB not ready:", (err as Error)?.message);
        return NextResponse.json({ status: "warming" }, { status: 503 });
    }
}
