import { NextRequest, NextResponse } from "next/server";
import { fetchRawgGames } from "@/lib/games/rawg";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    try {
        const games = await fetchRawgGames(query);
        return NextResponse.json({ games });
    } catch (err) {
        console.error("[/api/games/search] Error:", err);
        return NextResponse.json({ games: [], error: "Search failed" }, { status: 500 });
    }
}
