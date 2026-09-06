"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GameCover } from "./GameCover";
import { GameStatusBadge } from "./GameStatusBadge";
import { LogSessionModal } from "./LogSessionModal";
import { Clock, ExternalLink } from "lucide-react";

export interface GameRowData {
    userGameId: string;
    gameId: string;
    title: string;
    coverUrl: string | null;
    releaseYear: number | null;
    platforms: string[];
    status: string;
    hoursLogged: number;
    rating?: number | null;
    updatedAt: string | Date;
}

interface GameRowProps {
    data: GameRowData;
    showLogButton?: boolean;
}

export function GameRow({ data, showLogButton = true }: GameRowProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formattedDate = new Date(data.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const platformText = data.platforms.length > 0 ? data.platforms.join(", ") : "PC";

    return (
        <>
            <div className="group border-b border-[#222220] hover:bg-[#161615] transition-colors py-2.5 px-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
                {/* Left: Cover + Title + Platform */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Link href={`/game/${data.gameId}`} className="shrink-0">
                        <GameCover title={data.title} coverUrl={data.coverUrl} className="w-10 h-14" />
                    </Link>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Link
                                href={`/game/${data.gameId}`}
                                className="font-heading font-semibold text-base md:text-lg text-[#edebe6] group-hover:text-white transition-colors truncate max-w-[320px]"
                            >
                                {data.title}
                            </Link>
                            {data.releaseYear && (
                                <span className="font-mono-num text-xs text-[#696861]">
                                    ({data.releaseYear})
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-xs font-mono-num text-[#9c9a92] flex-wrap">
                            <span className="truncate max-w-[200px]" title={platformText}>
                                {platformText}
                            </span>
                            {data.rating && (
                                <span className="text-[#edebe6] bg-[#222220] px-1.5 py-0.2 border border-[#333330] rounded-[2px]">
                                    ★ {data.rating.toFixed(1)} / 10
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Metadata + Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 font-mono-num">
                    {/* Status Badge */}
                    <div className="w-32 hidden sm:block text-center">
                        <GameStatusBadge status={data.status} size="sm" />
                    </div>

                    {/* Hours Logged */}
                    <div className="text-right min-w-[75px]">
                        <div className="text-xs text-[#edebe6] font-semibold">
                            {data.hoursLogged.toFixed(1)}h
                        </div>
                        <div className="text-[10px] text-[#696861]">logged</div>
                    </div>

                    {/* Last Updated */}
                    <div className="text-right text-[11px] text-[#9c9a92] hidden lg:block min-w-[85px]">
                        <div className="text-[#696861] text-[10px] uppercase">Updated</div>
                        <div>{formattedDate}</div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 pl-2">
                        {showLogButton && (
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="px-2.5 py-1 text-xs font-mono-num text-[#edebe6] bg-[#222220] hover:bg-[#2e2e2a] border border-[#333330] hover:border-[#4a4a44] rounded-[2px] transition-colors flex items-center gap-1"
                                title="Log playtime"
                            >
                                <Clock className="w-3 h-3 text-[#9c9a92]" />
                                <span>Log</span>
                            </button>
                        )}

                        <Link
                            href={`/game/${data.gameId}`}
                            className="px-2.5 py-1 text-xs font-mono-num text-[#9c9a92] hover:text-[#edebe6] bg-[#171716] hover:bg-[#222220] border border-[#262624] hover:border-[#383834] rounded-[2px] transition-colors"
                        >
                            Open
                        </Link>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <LogSessionModal
                    userGameId={data.userGameId}
                    gameTitle={data.title}
                    currentHours={data.hoursLogged}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
}
