import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { GameCover } from "@/components/games/GameCover";
import { GameStatusBadge } from "@/components/games/GameStatusBadge";
import { Plus, Search, Bookmark } from "lucide-react";

export const metadata = {
    title: "Watchlist — Game Tracker",
};

interface WatchlistProps {
    searchParams: Promise<{ sort?: string }>;
}

export default async function WatchlistPage({ searchParams }: WatchlistProps) {
    const session = await getSession();
    const resolvedParams = await searchParams;
    const sortOption = resolvedParams?.sort || "dateAdded";

    const userGames = await prisma.userGame.findMany({
        where: {
            userId: session!.userId,
            status: "WANT_TO_PLAY",
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
    });

    // Client / In-memory sorting based on requested parameter
    const sortedGames = [...userGames].sort((a, b) => {
        if (sortOption === "releaseDate") {
            const yearA = a.game.releaseYear || 0;
            const yearB = b.game.releaseYear || 0;
            return yearB - yearA;
        } else if (sortOption === "title") {
            return a.game.title.localeCompare(b.game.title);
        } else if (sortOption === "platform") {
            const pA = a.game.platforms[0]?.platform.name || "";
            const pB = b.game.platforms[0]?.platform.name || "";
            return pA.localeCompare(pB);
        } else {
            // dateAdded desc
            return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        }
    });

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262624]">
                <div>
                    <h1 className="font-heading font-bold text-3xl text-[#edebe6] uppercase tracking-wider">
                        Watchlist
                    </h1>
                    <p className="text-xs font-mono-num text-[#9c9a92] mt-1">
                        {sortedGames.length} {sortedGames.length === 1 ? "game" : "games"} saved to play
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Sorting control */}
                    <div className="flex items-center gap-2 font-mono-num text-xs">
                        <span className="text-[#696861]">Sort:</span>
                        <div className="flex bg-[#171716] border border-[#262624] rounded-[2px] p-0.5">
                            {[
                                { id: "dateAdded", label: "Added" },
                                { id: "releaseDate", label: "Release" },
                                { id: "platform", label: "Platform" },
                                { id: "title", label: "Title" },
                            ].map((opt) => (
                                <Link
                                    key={opt.id}
                                    href={`/watchlist?sort=${opt.id}`}
                                    className={`px-2.5 py-1 rounded-[2px] transition-colors ${sortOption === opt.id
                                            ? "bg-[#282824] text-[#edebe6] font-semibold"
                                            : "text-[#9c9a92] hover:text-[#edebe6]"
                                        }`}
                                >
                                    {opt.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <Link
                        href="/search"
                        className="px-3 py-2 text-xs font-mono-num text-[#edebe6] bg-[#222220] hover:bg-[#2e2e2a] border border-[#333330] rounded-[2px] transition-colors flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4 text-[#9c9a92]" />
                        <span>Add Game</span>
                    </Link>
                </div>
            </div>

            {/* Cover-Forward List */}
            {sortedGames.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedGames.map((ug) => {
                        const addedDate = new Date(ug.dateAdded).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        });
                        const platforms = ug.game.platforms.map((p) => p.platform.name).join(" · ");

                        return (
                            <div
                                key={ug.id}
                                className="bg-[#171716] border border-[#262624] hover:border-[#383834] rounded-[3px] p-3 flex gap-4 transition-colors group"
                            >
                                <Link href={`/game/${ug.game.id}`} className="shrink-0">
                                    <GameCover title={ug.game.title} coverUrl={ug.game.coverUrl} className="w-16 h-22" />
                                </Link>

                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    <div>
                                        <Link
                                            href={`/game/${ug.game.id}`}
                                            className="font-heading font-semibold text-lg text-[#edebe6] group-hover:text-white transition-colors truncate block"
                                        >
                                            {ug.game.title}
                                        </Link>
                                        <p className="text-xs font-mono-num text-[#9c9a92] mt-0.5 truncate">
                                            {platforms || "PC"} {ug.game.releaseYear ? `· ${ug.game.releaseYear}` : ""}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-[#222220] text-xs font-mono-num">
                                        <span className="text-[#696861]">Added {addedDate}</span>
                                        <Link
                                            href={`/game/${ug.game.id}`}
                                            className="text-[#9c9a92] hover:text-[#edebe6] uppercase font-semibold text-[11px]"
                                        >
                                            Details →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Empty State per section 23 */
                <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-12 text-center my-8">
                    <Bookmark className="w-10 h-10 text-[#696861] mx-auto mb-3 stroke-1" />
                    <h3 className="font-heading font-semibold text-xl text-[#edebe6] uppercase tracking-wide">
                        No games yet
                    </h3>
                    <p className="text-xs font-mono-num text-[#9c9a92] mt-2 max-w-sm mx-auto">
                        No games yet — search above to add one.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/search"
                            className="px-4 py-2 text-xs font-mono-num text-[#edebe6] bg-[#222220] hover:bg-[#2e2e2a] border border-[#333330] rounded-[2px]"
                        >
                            Search Games
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
