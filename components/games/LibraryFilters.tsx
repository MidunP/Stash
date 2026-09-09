"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STATUS_LABELS } from "./GameStatusBadge";

interface LibraryFiltersProps {
    currentStatus: string;
    currentPlatform: string;
    currentYear: string;
    currentSort: string;
    platformOptions: string[];
    yearOptions: number[];
}

export function LibraryFilters({
    currentStatus,
    currentPlatform,
    currentYear,
    currentSort,
    platformOptions,
    yearOptions,
}: LibraryFiltersProps) {
    const router = useRouter();

    const buildUrl = (newParams: Record<string, string>) => {
        const q = new URLSearchParams({
            status: currentStatus,
            platform: currentPlatform,
            year: currentYear,
            sort: currentSort,
            ...newParams,
        });
        return `/library?${q.toString()}`;
    };

    const handleFilterChange = (key: string, value: string) => {
        const url = buildUrl({ [key]: value });
        router.push(url);
    };

    const statusFilters = [
        { id: "ALL", label: "All" },
        { id: "PLAYING", label: STATUS_LABELS.PLAYING },
        { id: "WANT_TO_PLAY", label: STATUS_LABELS.WANT_TO_PLAY },
        { id: "COMPLETED", label: STATUS_LABELS.COMPLETED },
        { id: "ON_HOLD", label: STATUS_LABELS.ON_HOLD },
        { id: "DROPPED", label: STATUS_LABELS.DROPPED },
    ];

    return (
        <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-4 space-y-4 font-mono-num text-xs">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[#696861] uppercase text-[11px] mr-1">Status:</span>
                {statusFilters.map((st) => (
                    <Link
                        key={st.id}
                        href={buildUrl({ status: st.id })}
                        className={`px-2.5 py-1 rounded-[2px] transition-colors ${currentStatus === st.id
                            ? "bg-[#282824] text-[#edebe6] font-semibold border border-[#4a4a44]"
                            : "text-[#9c9a92] hover:text-[#edebe6] bg-[#141413] border border-[#222220]"
                            }`}
                    >
                        {st.label}
                    </Link>
                ))}
            </div>

            {/* Platform, Year & Sort dropdowns */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[#222220]">
                {/* Platform */}
                <div className="flex items-center gap-2">
                    <label className="text-[#696861] uppercase text-[11px]">Platform:</label>
                    <select
                        value={currentPlatform}
                        onChange={(e) => handleFilterChange("platform", e.target.value)}
                        className="bg-[#111110] border border-[#383834] rounded-[2px] px-2 py-1 text-xs text-[#edebe6] focus:outline-none"
                    >
                        <option value="ALL">All Platforms</option>
                        {platformOptions.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Release Year */}
                <div className="flex items-center gap-2">
                    <label className="text-[#696861] uppercase text-[11px]">Year:</label>
                    <select
                        value={currentYear}
                        onChange={(e) => handleFilterChange("year", e.target.value)}
                        className="bg-[#111110] border border-[#383834] rounded-[2px] px-2 py-1 text-xs text-[#edebe6] focus:outline-none"
                    >
                        <option value="ALL">All Years</option>
                        {yearOptions.map((y) => (
                            <option key={y} value={String(y)}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort By */}
                <div className="flex items-center gap-2 ml-auto">
                    <label className="text-[#696861] uppercase text-[11px]">Sort By:</label>
                    <select
                        value={currentSort}
                        onChange={(e) => handleFilterChange("sort", e.target.value)}
                        className="bg-[#111110] border border-[#383834] rounded-[2px] px-2 py-1 text-xs text-[#edebe6] focus:outline-none"
                    >
                        <option value="recentlyAdded">Recently Added</option>
                        <option value="recentlyUpdated">Recently Updated</option>
                        <option value="releaseDate">Release Date</option>
                        <option value="title">Title</option>
                        <option value="rating">Rating</option>
                        <option value="playtime">Playtime</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
