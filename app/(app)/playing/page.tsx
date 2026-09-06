import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { GameRow } from "@/components/games/GameRow";
import { Gamepad2, Plus, Search } from "lucide-react";

export const metadata = {
    title: "Currently Playing — Game Tracker",
};

export default async function PlayingPage() {
    const session = await getSession();

    const userGames = await prisma.userGame.findMany({
        where: {
            userId: session!.userId,
            status: "PLAYING",
        },
        include: {
            game: {
                include: {
                    platforms: {
                        include: { platform: true },
                    },
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    const formattedGames = userGames.map((ug) => ({
        userGameId: ug.id,
        gameId: ug.game.id,
        title: ug.game.title,
        coverUrl: ug.game.coverUrl,
        releaseYear: ug.game.releaseYear,
        platforms: ug.game.platforms.map((p) => p.platform.name),
        status: ug.status,
        hoursLogged: ug.hoursLogged,
        rating: ug.rating,
        updatedAt: ug.updatedAt,
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262624]">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block"></span>
                        <h1 className="font-heading font-bold text-3xl text-[#edebe6] uppercase tracking-wider">
                            Currently Playing
                        </h1>
                    </div>
                    <p className="text-xs font-mono-num text-[#9c9a92] mt-1">
                        {formattedGames.length} {formattedGames.length === 1 ? "game" : "games"} in progress
                    </p>
                </div>

                <Link
                    href="/search"
                    className="self-start sm:self-auto px-3 py-2 text-xs font-mono-num text-[#edebe6] bg-[#222220] hover:bg-[#2e2e2a] border border-[#333330] hover:border-[#4a4a44] rounded-[2px] transition-colors flex items-center gap-1.5"
                >
                    <Plus className="w-4 h-4 text-[#9c9a92]" />
                    <span>Add Game</span>
                </Link>
            </div>

            {/* Dense List */}
            {formattedGames.length > 0 ? (
                <div className="bg-[#171716] border border-[#262624] rounded-[3px] overflow-hidden divide-y divide-[#222220]">
                    {formattedGames.map((game) => (
                        <GameRow key={game.userGameId} data={game} showLogButton={true} />
                    ))}
                </div>
            ) : (
                /* Empty State per section 23 */
                <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-12 text-center my-8">
                    <Gamepad2 className="w-10 h-10 text-[#696861] mx-auto mb-3 stroke-1" />
                    <h3 className="font-heading font-semibold text-xl text-[#edebe6] uppercase tracking-wide">
                        Nothing in progress
                    </h3>
                    <p className="text-xs font-mono-num text-[#9c9a92] mt-2 max-w-sm mx-auto">
                        Pick something from your watchlist or search the database to add a game.
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <Link
                            href="/watchlist"
                            className="px-4 py-2 text-xs font-mono-num text-[#edebe6] bg-[#222220] hover:bg-[#2e2e2a] border border-[#333330] rounded-[2px]"
                        >
                            View Watchlist
                        </Link>
                        <Link
                            href="/search"
                            className="px-4 py-2 text-xs font-mono-num text-[#9c9a92] hover:text-[#edebe6] border border-[#262624] hover:border-[#383834] rounded-[2px]"
                        >
                            Search Games
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
