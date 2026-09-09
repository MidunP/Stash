import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { GameRow } from "@/components/games/GameRow";
import { LibraryFilters } from "@/components/games/LibraryFilters";
import { Library, Plus } from "lucide-react";

export const metadata = {
    title: "Library — Game Tracker",
};

interface LibraryProps {
    searchParams: Promise<{
        status?: string;
        platform?: string;
        year?: string;
        sort?: string;
    }>;
}

export default async function LibraryPage({ searchParams }: LibraryProps) {
    const session = await getSession();
    const params = await searchParams;

    const currentStatus = params?.status || "ALL";
    const currentPlatform = params?.platform || "ALL";
    const currentYear = params?.year || "ALL";
    const currentSort = params?.sort || "recentlyAdded";

    // Query all user games
    const allUserGames = await prisma.userGame.findMany({
        where: {
            userId: session!.userId,
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

    // Extract dynamic platform options
    const platformSet = new Set<string>();
    const yearSet = new Set<number>();

    allUserGames.forEach((ug) => {
        ug.game.platforms.forEach((p) => platformSet.add(p.platform.name));
        if (ug.game.releaseYear) yearSet.add(ug.game.releaseYear);
    });

    const platformOptions = Array.from(platformSet).sort();
    const yearOptions = Array.from(yearSet).sort((a, b) => b - a);

    // Apply filters
    let filteredGames = allUserGames.filter((ug) => {
        if (currentStatus !== "ALL" && ug.status !== currentStatus) return false;
        if (currentPlatform !== "ALL") {
            const hasPlatform = ug.game.platforms.some((p) => p.platform.name === currentPlatform);
            if (!hasPlatform) return false;
        }
        if (currentYear !== "ALL" && ug.game.releaseYear !== Number(currentYear)) {
            return false;
        }
        return true;
    });

    // Apply sorting
    filteredGames.sort((a, b) => {
        if (currentSort === "recentlyUpdated") {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        } else if (currentSort === "releaseDate") {
            return (b.game.releaseYear || 0) - (a.game.releaseYear || 0);
        } else if (currentSort === "title") {
            return a.game.title.localeCompare(b.game.title);
        } else if (currentSort === "rating") {
            return (b.rating || 0) - (a.rating || 0);
        } else if (currentSort === "playtime") {
            return b.hoursLogged - a.hoursLogged;
        } else {
            // recentlyAdded
            return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        }
    });

    const formattedGames = filteredGames.map((ug) => ({
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
                    <h1 className="font-heading font-bold text-3xl text-[#edebe6] uppercase tracking-wider">
                        Game Library
                    </h1>
                    <p className="text-xs font-mono-num text-[#9c9a92] mt-1">
                        Showing {formattedGames.length} of {allUserGames.length} total entries
                    </p>
                </div>

                <Link
                    href="/search"
                    className="px-3 py-2 text-xs font-mono-num text-[#edebe6] bg-[#222220] hover:bg-[#2e2e2a] border border-[#333330] rounded-[2px] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4 text-[#9c9a92]" />
                    <span>Add Game</span>
                </Link>
            </div>

            {/* Filters Bar */}
            <LibraryFilters
                currentStatus={currentStatus}
                currentPlatform={currentPlatform}
                currentYear={currentYear}
                currentSort={currentSort}
                platformOptions={platformOptions}
                yearOptions={yearOptions}
            />

            {/* Library Games List */}
            {formattedGames.length > 0 ? (
                <div className="bg-[#171716] border border-[#262624] rounded-[3px] overflow-hidden divide-y divide-[#222220]">
                    {formattedGames.map((game) => (
                        <GameRow key={game.userGameId} data={game} showLogButton={true} />
                    ))}
                </div>
            ) : (
                /* Empty State per section 23 */
                <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-12 text-center my-8">
                    <Library className="w-10 h-10 text-[#696861] mx-auto mb-3 stroke-1" />
                    <h3 className="font-heading font-semibold text-xl text-[#edebe6] uppercase tracking-wide">
                        Your library is empty
                    </h3>
                    <p className="text-xs font-mono-num text-[#9c9a92] mt-2 max-w-sm mx-auto">
                        Your library is empty — search for a game to get started.
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
