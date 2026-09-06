import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getGameDetails } from "@/lib/games/provider";
import { GameCover } from "@/components/games/GameCover";
import { GameStatusBadge } from "@/components/games/GameStatusBadge";
import { StatusEditForm } from "@/components/games/StatusEditForm";
import { GameNotesAndRatingForm } from "@/components/games/GameNotesAndRatingForm";
import { StatusHistoryTimeline } from "@/components/games/StatusHistoryTimeline";
import { LogSessionModal } from "@/components/games/LogSessionModal";
import { removeUserGameAction } from "@/app/actions/games";
import { ArrowLeft, Clock, Trash2, Calendar, Monitor } from "lucide-react";

interface GameDetailPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: GameDetailPageProps) {
    const resolvedParams = await params;
    const game = await prisma.game.findUnique({
        where: { id: resolvedParams.id },
    });
    return {
        title: game ? `${game.title} — Game Tracker` : "Game Detail — Game Tracker",
    };
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
    const session = await getSession();
    const resolvedParams = await params;
    const gameId = resolvedParams.id;

    // 1. Fetch game record from database
    let dbGame = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
            platforms: {
                include: { platform: true },
            },
        },
    });

    if (!dbGame) {
        notFound();
    }

    // 2. Fetch UserGame relationship for current user
    const userGame = await prisma.userGame.findUnique({
        where: {
            userId_gameId: {
                userId: session!.userId,
                gameId: dbGame.id,
            },
        },
        include: {
            statusHistory: {
                orderBy: { changedAt: "desc" },
            },
            playSessions: {
                orderBy: { playedAt: "desc" },
            },
        },
    });

    const platforms = dbGame.platforms.map((p) => p.platform.name);

    return (
        <div className="space-y-8">
            {/* Back Link */}
            <div>
                <Link
                    href="/library"
                    className="inline-flex items-center gap-1.5 text-xs font-mono-num text-[#9c9a92] hover:text-[#edebe6] transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Library</span>
                </Link>
            </div>

            {/* Hero / Game Overview Header */}
            <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-6 flex flex-col md:flex-row gap-6">
                {/* Cover Artwork */}
                <GameCover
                    title={dbGame.title}
                    coverUrl={dbGame.coverUrl}
                    className="w-36 h-48 md:w-44 md:h-60 mx-auto md:mx-0 shadow-lg"
                />

                {/* Details & Quick Metadata */}
                <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div>
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <h1 className="font-heading font-bold text-3xl md:text-4xl text-[#edebe6] uppercase tracking-wide">
                                {dbGame.title}
                            </h1>
                            {userGame && <GameStatusBadge status={userGame.status} size="md" />}
                        </div>

                        <div className="flex items-center gap-3 mt-2 text-xs font-mono-num text-[#9c9a92] flex-wrap">
                            {dbGame.releaseYear && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-[#696861]" />
                                    <span>{dbGame.releaseYear}</span>
                                </span>
                            )}
                            {platforms.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <Monitor className="w-3.5 h-3.5 text-[#696861]" />
                                    <span>{platforms.join(", ")}</span>
                                </span>
                            )}
                        </div>

                        {dbGame.description && (
                            <p className="mt-4 text-xs font-sans text-[#9c9a92] leading-relaxed max-w-2xl line-clamp-3">
                                {dbGame.description}
                            </p>
                        )}
                    </div>

                    {/* Quick Metrics Bar */}
                    {userGame && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#222220] font-mono-num">
                            <div>
                                <span className="text-[10px] text-[#696861] uppercase block">Hours Logged</span>
                                <span className="text-base text-[#edebe6] font-semibold">
                                    {userGame.hoursLogged.toFixed(1)} hrs
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-[#696861] uppercase block">Rating</span>
                                <span className="text-base text-[#edebe6] font-semibold">
                                    {userGame.rating ? `${userGame.rating.toFixed(1)} / 10` : "Not Rated"}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-[#696861] uppercase block">Date Added</span>
                                <span className="text-xs text-[#edebe6]">
                                    {new Date(userGame.dateAdded).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-[#696861] uppercase block">Last Updated</span>
                                <span className="text-xs text-[#edebe6]">
                                    {new Date(userGame.updatedAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Grid: User Controls & Timeline */}
            {userGame ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Status Edit, Rating & Notes */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Editing */}
                        <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-5 space-y-3">
                            <h2 className="font-heading font-semibold text-lg text-[#edebe6] uppercase">
                                Update Status
                            </h2>
                            <StatusEditForm userGameId={userGame.id} currentStatus={userGame.status} />
                        </div>

                        {/* Notes & Rating Form */}
                        <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-5">
                            <h2 className="font-heading font-semibold text-lg text-[#edebe6] uppercase mb-4 pb-2 border-b border-[#262624]">
                                Personal Rating & Notes
                            </h2>
                            <GameNotesAndRatingForm
                                userGameId={userGame.id}
                                initialRating={userGame.rating}
                                initialNotes={userGame.notes}
                            />
                        </div>
                    </div>

                    {/* Right Col: Timeline & Danger zone */}
                    <div className="space-y-6">
                        {/* Status History Timeline */}
                        <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-5">
                            <h2 className="font-heading font-semibold text-base text-[#edebe6] uppercase mb-4 pb-2 border-b border-[#262624] tracking-wide">
                                Status History
                            </h2>
                            <StatusHistoryTimeline history={userGame.statusHistory} />
                        </div>

                        {/* Remove from Library action */}
                        <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-5 space-y-3">
                            <h3 className="font-heading font-semibold text-sm text-[#9c9a92] uppercase">
                                Manage Entry
                            </h3>
                            <form
                                action={async () => {
                                    "use server";
                                    await removeUserGameAction(userGame.id);
                                    redirect("/library");
                                }}
                            >
                                <button
                                    type="submit"
                                    className="w-full py-2 px-3 text-xs font-mono-num text-[#f87171] hover:bg-[#291617] border border-[#4d2325] rounded-[2px] transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Remove from Library</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                /* If not in user library */
                <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-8 text-center">
                    <p className="text-xs font-mono-num text-[#9c9a92]">
                        This game is not currently in your personal library.
                    </p>
                    <div className="mt-4">
                        <Link
                            href="/search"
                            className="px-4 py-2 text-xs font-mono-num text-[#edebe6] bg-[#222220] hover:bg-[#2e2e2a] border border-[#333330] rounded-[2px]"
                        >
                            Add to Library
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
