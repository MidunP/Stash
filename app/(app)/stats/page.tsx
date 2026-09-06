import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { BarChart2, CheckCircle2, Clock, Gamepad2, Award } from "lucide-react";

export const metadata = {
    title: "Statistics — Game Tracker",
};

export default async function StatsPage() {
    const session = await getSession();
    const userId = session!.userId;
    const currentYear = new Date().getFullYear();

    // 1. Fetch user games
    const userGames = await prisma.userGame.findMany({
        where: { userId },
    });

    // 2. Fetch play sessions for current year
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const yearlySessions = await prisma.playSession.findMany({
        where: {
            userGame: { userId },
            playedAt: {
                gte: startOfYear,
                lte: endOfYear,
            },
        },
    });

    // Calculations
    const totalLibraryCount = userGames.length;

    const playedGamesCount = userGames.filter((g) =>
        ["PLAYING", "COMPLETED", "ON_HOLD", "DROPPED"].includes(g.status)
    ).length;

    const completedCount = userGames.filter((g) => g.status === "COMPLETED").length;
    const droppedCount = userGames.filter((g) => g.status === "DROPPED").length;
    const playingCount = userGames.filter((g) => g.status === "PLAYING").length;
    const wantToPlayCount = userGames.filter((g) => g.status === "WANT_TO_PLAY").length;
    const onHoldCount = userGames.filter((g) => g.status === "ON_HOLD").length;

    // Completion rate calculation: completed / (completed + dropped)
    const completionDenominator = completedCount + droppedCount;
    const completionRatePercent =
        completionDenominator > 0
            ? Math.round((completedCount / completionDenominator) * 100)
            : null;

    // Hours logged this year from PlaySession sum
    const hoursThisYear = yearlySessions.reduce((acc, sess) => acc + sess.hours, 0);

    // Total overall hours
    const totalHoursAllTime = userGames.reduce((acc, g) => acc + g.hoursLogged, 0);

    // Average rating of rated games
    const ratedGames = userGames.filter((g) => g.rating !== null);
    const avgRating =
        ratedGames.length > 0
            ? (ratedGames.reduce((acc, g) => acc + (g.rating || 0), 0) / ratedGames.length).toFixed(1)
            : null;

    const hasData = totalLibraryCount > 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-[#262624]">
                <h1 className="font-heading font-bold text-3xl text-[#edebe6] uppercase tracking-wider">
                    Gaming Statistics
                </h1>
                <p className="text-xs font-mono-num text-[#9c9a92] mt-1">
                    Calculated strictly from your personal database activity
                </p>
            </div>

            {hasData ? (
                <div className="space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-num">
                        {/* Total Played */}
                        <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#696861] uppercase">Total Games Played</span>
                                <Gamepad2 className="w-4 h-4 text-[#9c9a92] stroke-1" />
                            </div>
                            <div className="text-3xl text-[#edebe6] font-bold mt-3">
                                {playedGamesCount}
                            </div>
                            <p className="text-[11px] text-[#696861] mt-1">
                                Playing, Completed, On Hold, or Dropped
                            </p>
                        </div>

                        {/* Completed */}
                        <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#696861] uppercase">Completed Games</span>
                                <CheckCircle2 className="w-4 h-4 text-[#4ade80] stroke-1" />
                            </div>
                            <div className="text-3xl text-[#4ade80] font-bold mt-3">
                                {completedCount}
                            </div>
                            <p className="text-[11px] text-[#696861] mt-1">
                                Successfully finished games
                            </p>
                        </div>

                        {/* Completion Rate */}
                        <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#696861] uppercase">Completion Rate</span>
                                <Award className="w-4 h-4 text-[#9c9a92] stroke-1" />
                            </div>
                            <div className="text-3xl text-[#edebe6] font-bold mt-3">
                                {completionRatePercent !== null ? `${completionRatePercent}%` : "N/A"}
                            </div>
                            <p className="text-[11px] text-[#696861] mt-1">
                                Calculated as completed / (completed + dropped)
                            </p>
                        </div>

                        {/* Hours This Year */}
                        <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#696861] uppercase">Hours Logged ({currentYear})</span>
                                <Clock className="w-4 h-4 text-[#f59e0b] stroke-1" />
                            </div>
                            <div className="text-3xl text-[#f59e0b] font-bold mt-3">
                                {hoursThisYear.toFixed(1)}h
                            </div>
                            <p className="text-[11px] text-[#696861] mt-1">
                                Sum of play sessions logged in {currentYear}
                            </p>
                        </div>
                    </div>

                    {/* Breakdown Table & Secondary Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Status Breakdown Table */}
                        <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-5 font-mono-num text-xs">
                            <h3 className="font-heading font-semibold text-base text-[#edebe6] uppercase mb-4 pb-2 border-b border-[#262624]">
                                Library Status Breakdown
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-1 border-b border-[#222220]">
                                    <span className="text-[#f59e0b] font-medium uppercase">Currently Playing</span>
                                    <span className="text-[#edebe6] font-bold">{playingCount}</span>
                                </div>
                                <div className="flex items-center justify-between py-1 border-b border-[#222220]">
                                    <span className="text-[#a3a39d] uppercase">Want to Play</span>
                                    <span className="text-[#edebe6] font-bold">{wantToPlayCount}</span>
                                </div>
                                <div className="flex items-center justify-between py-1 border-b border-[#222220]">
                                    <span className="text-[#4ade80] font-medium uppercase">Completed</span>
                                    <span className="text-[#edebe6] font-bold">{completedCount}</span>
                                </div>
                                <div className="flex items-center justify-between py-1 border-b border-[#222220]">
                                    <span className="text-[#94a3b8] uppercase">On Hold</span>
                                    <span className="text-[#edebe6] font-bold">{onHoldCount}</span>
                                </div>
                                <div className="flex items-center justify-between py-1">
                                    <span className="text-[#f87171] uppercase">Dropped</span>
                                    <span className="text-[#edebe6] font-bold">{droppedCount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Lifetime Metrics */}
                        <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-5 font-mono-num text-xs space-y-4">
                            <h3 className="font-heading font-semibold text-base text-[#edebe6] uppercase pb-2 border-b border-[#262624]">
                                Lifetime Overview
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[#9c9a92]">Total Games in Library:</span>
                                    <span className="text-[#edebe6] font-bold">{totalLibraryCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[#9c9a92]">All-Time Playtime Logged:</span>
                                    <span className="text-[#edebe6] font-bold">{totalHoursAllTime.toFixed(1)} hrs</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[#9c9a92]">Average User Rating:</span>
                                    <span className="text-[#edebe6] font-bold">
                                        {avgRating ? `${avgRating} / 10` : "No ratings yet"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[#9c9a92]">Play Sessions Recorded:</span>
                                    <span className="text-[#edebe6] font-bold">{yearlySessions.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Empty State per section 23 */
                <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-12 text-center my-8">
                    <BarChart2 className="w-10 h-10 text-[#696861] mx-auto mb-3 stroke-1" />
                    <h3 className="font-heading font-semibold text-xl text-[#edebe6] uppercase tracking-wide">
                        Not enough data yet
                    </h3>
                    <p className="text-xs font-mono-num text-[#9c9a92] mt-2 max-w-sm mx-auto">
                        Not enough data yet. Start tracking some games to see your stats.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/search"
                            className="px-4 py-2 text-xs font-mono-num text-[#edebe6] bg-[#222220] hover:bg-[#2e2e2a] border border-[#333330] rounded-[2px]"
                        >
                            Search & Add Games
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
