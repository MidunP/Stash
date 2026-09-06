"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { addGameToLibraryAction } from "@/app/actions/games";
import { NormalizedGame } from "@/lib/games/types";
import { GameCover } from "./GameCover";
import { STATUS_LABELS } from "./GameStatusBadge";
import { X, Check } from "lucide-react";

import { useToast } from "@/components/ui/Toast";

interface AddGameModalProps {
    game: NormalizedGame;
    isOpen: boolean;
    onClose: () => void;
}

export function AddGameModal({ game, isOpen, onClose }: AddGameModalProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>("WANT_TO_PLAY");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { showToast } = useToast();

    if (!isOpen) return null;

    const statuses = [
        { value: "PLAYING", label: STATUS_LABELS.PLAYING },
        { value: "WANT_TO_PLAY", label: STATUS_LABELS.WANT_TO_PLAY },
        { value: "COMPLETED", label: STATUS_LABELS.COMPLETED },
        { value: "ON_HOLD", label: STATUS_LABELS.ON_HOLD },
        { value: "DROPPED", label: STATUS_LABELS.DROPPED },
    ];

    const handleAdd = async () => {
        setLoading(true);
        setError(null);

        const res = await addGameToLibraryAction(game.externalId, selectedStatus);
        setLoading(false);

        if (res?.error) {
            setError(res.error);
            showToast(res.error, "error");
        } else {
            showToast(`Added "${game.title}" to library!`, "success");
            onClose();
            if (selectedStatus === "PLAYING") {
                router.push("/playing");
            } else if (selectedStatus === "WANT_TO_PLAY") {
                router.push("/watchlist");
            } else {
                router.push("/library");
            }
        }
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-[1px]">
            <div className="bg-[#171716] border border-[#383834] rounded-[3px] w-full max-w-md p-6 shadow-2xl relative">
                <div className="flex items-start justify-between pb-4 border-b border-[#262624]">
                    <div className="flex items-center gap-3">
                        <GameCover title={game.title} coverUrl={game.coverUrl} className="w-12 h-16" />
                        <div>
                            <h3 className="font-heading font-semibold text-xl text-[#edebe6] uppercase">
                                {game.title}
                            </h3>
                            <p className="text-xs font-mono-num text-[#9c9a92] mt-0.5">
                                {game.releaseYear ? `${game.releaseYear} · ` : ""}
                                {game.platforms.slice(0, 3).join(", ")}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-[#696861] hover:text-[#edebe6] p-1 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="py-5 space-y-4">
                    <label className="block text-xs font-mono-num text-[#9c9a92] uppercase tracking-wider">
                        Select Status for Your Library
                    </label>

                    <div className="space-y-1.5">
                        {statuses.map((st) => (
                            <label
                                key={st.value}
                                onClick={() => setSelectedStatus(st.value)}
                                className={`flex items-center justify-between p-3 rounded-[2px] border cursor-pointer transition-colors ${selectedStatus === st.value
                                    ? "bg-[#222220] border-[#696861] text-[#edebe6]"
                                    : "bg-[#141413] border-[#262624] text-[#9c9a92] hover:border-[#383834] hover:text-[#edebe6]"
                                    }`}
                            >
                                <span className="font-heading font-medium text-base tracking-wide uppercase">
                                    {st.label}
                                </span>
                                {selectedStatus === st.value && (
                                    <Check className="w-4 h-4 text-[#edebe6]" />
                                )}
                            </label>
                        ))}
                    </div>

                    {error && (
                        <div className="p-3 text-xs font-mono-num text-[#f87171] bg-[#291617] border border-[#4d2325] rounded-[2px]">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262624]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-mono-num text-[#9c9a92] hover:text-[#edebe6] border border-[#262624] hover:border-[#383834] rounded-[2px]"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={loading}
                        className="px-5 py-2 text-xs font-mono-num font-semibold bg-[#2e2e2a] hover:bg-[#3d3d37] text-[#edebe6] border border-[#4a4a44] rounded-[2px] transition-colors disabled:opacity-50"
                    >
                        {loading ? "Adding..." : "Add to Library"}
                    </button>
                </div>
            </div>
        </div>
    );
}
