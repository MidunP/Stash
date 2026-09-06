"use client";

import React, { useState, useEffect, useTransition } from "react";
import { searchGames } from "@/lib/games/provider";
import { NormalizedGame } from "@/lib/games/types";
import { GameCover } from "@/components/games/GameCover";
import { AddGameModal } from "@/components/games/AddGameModal";
import { Search, Plus, Loader2 } from "lucide-react";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<NormalizedGame[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedGame, setSelectedGame] = useState<NormalizedGame | null>(null);
    const [isPending, startTransition] = useTransition();

    // Initial load default top games
    useEffect(() => {
        let active = true;
        setLoading(true);
        searchGames("")
            .then((res) => {
                if (active) setResults(res);
            })
            .catch((err) => console.error("Search init error:", err))
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        startTransition(async () => {
            try {
                const res = await searchGames(query);
                setResults(res);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-[#262624]">
                <h1 className="font-heading font-bold text-3xl text-[#edebe6] uppercase tracking-wider">
                    Search Database
                </h1>
                <p className="text-xs font-mono-num text-[#9c9a92] mt-1">
                    Search real video game database to add games to your library
                </p>
            </div>

            {/* Prominent Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search games by title..."
                    className="w-full bg-[#171716] border border-[#383834] focus:border-[#9c9a92] rounded-[3px] py-3.5 pl-11 pr-24 font-mono-num text-base text-[#edebe6] placeholder-[#696861] focus:outline-none transition-colors shadow-inner"
                />
                <Search className="w-5 h-5 text-[#696861] absolute left-3.5 top-4" />
                <button
                    type="submit"
                    disabled={loading || isPending}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-[#282824] hover:bg-[#383834] text-[#edebe6] font-mono-num text-xs uppercase font-semibold rounded-[2px] border border-[#4a4a44] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                    {loading || isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        "Search"
                    )}
                </button>
            </form>

            {/* Results Section */}
            <div>
                <div className="flex items-center justify-between pb-3">
                    <span className="text-xs font-mono-num text-[#696861] uppercase tracking-wider">
                        {query.trim() ? `Search Results for "${query}"` : "Popular Games"}
                    </span>
                    <span className="text-xs font-mono-num text-[#9c9a92]">
                        {results.length} results
                    </span>
                </div>

                {/* Loading Skeletons */}
                {loading || isPending ? (
                    <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-4 space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                <div className="w-10 h-14 bg-[#262624] rounded-[2px] shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-[#262624] rounded w-1/3" />
                                    <div className="h-3 bg-[#1e1e1c] rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <div className="bg-[#171716] border border-[#262624] rounded-[3px] divide-y divide-[#222220]">
                        {results.map((game) => (
                            <div
                                key={game.externalId}
                                className="p-3 hover:bg-[#1f1f1d] transition-colors flex items-center justify-between gap-4 group"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <GameCover title={game.title} coverUrl={game.coverUrl} className="w-10 h-14" />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-heading font-semibold text-base md:text-lg text-[#edebe6] group-hover:text-white truncate">
                                            {game.title}
                                        </h3>
                                        <p className="text-xs font-mono-num text-[#9c9a92] mt-0.5 truncate">
                                            {game.platforms.slice(0, 4).join(" · ")}{" "}
                                            {game.releaseYear ? `(${game.releaseYear})` : ""}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedGame(game)}
                                    className="px-3 py-1.5 text-xs font-mono-num text-[#edebe6] bg-[#222220] hover:bg-[#2e2e2a] border border-[#333330] hover:border-[#4a4a44] rounded-[2px] transition-colors flex items-center gap-1.5 shrink-0"
                                >
                                    <Plus className="w-3.5 h-3.5 text-[#9c9a92]" />
                                    <span>Add Game</span>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-8 text-center text-xs font-mono-num text-[#9c9a92]">
                        No games found matching your search term.
                    </div>
                )}
            </div>

            {selectedGame && (
                <AddGameModal
                    game={selectedGame}
                    isOpen={!!selectedGame}
                    onClose={() => setSelectedGame(null)}
                />
            )}
        </div>
    );
}
