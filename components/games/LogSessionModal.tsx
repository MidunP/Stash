"use client";

import React, { useState } from "react";
import { logPlaySessionAction } from "@/app/actions/games";
import { X, Clock, Plus } from "lucide-react";

import { useToast } from "@/components/ui/Toast";

interface LogSessionModalProps {
    userGameId: string;
    gameTitle: string;
    currentHours: number;
    isOpen: boolean;
    onClose: () => void;
}

export function LogSessionModal({ userGameId, gameTitle, currentHours, isOpen, onClose }: LogSessionModalProps) {
    const [hours, setHours] = useState<string>("1.0");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = parseFloat(hours);
        if (isNaN(parsed) || parsed <= 0) {
            setError("Please enter a valid amount of hours (> 0).");
            return;
        }

        setLoading(true);
        setError(null);

        const res = await logPlaySessionAction(userGameId, parsed);
        setLoading(false);

        if (res.error) {
            setError(res.error);
            showToast(res.error, "error");
        } else {
            showToast(`Logged +${parsed}h for "${gameTitle}"!`, "success");
            onClose();
        }
    };


    const setQuickPreset = (val: number) => {
        setHours(val.toString());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[1px]">
            <div className="bg-[#171716] border border-[#383834] rounded-[3px] w-full max-w-sm p-5 shadow-2xl relative">
                <div className="flex items-start justify-between pb-3 mb-4 border-b border-[#262624]">
                    <div>
                        <h3 className="font-heading font-semibold text-lg text-[#edebe6] tracking-tight uppercase">
                            Log Play Session
                        </h3>
                        <p className="text-xs text-[#9c9a92] font-sans truncate max-w-[240px]">
                            {gameTitle}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-[#696861] hover:text-[#edebe6] p-1 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono-num text-[#9c9a92] uppercase mb-1.5">
                            Hours Played This Session
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="999"
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                                className="w-full bg-[#111110] border border-[#383834] rounded-[2px] px-3 py-2 text-sm font-mono-num text-[#edebe6] focus:outline-none focus:border-[#9c9a92]"
                                placeholder="e.g. 1.5"
                                required
                                autoFocus
                            />
                            <span className="absolute right-3 top-2.5 text-xs font-mono-num text-[#696861]">
                                hrs
                            </span>
                        </div>
                    </div>

                    <div>
                        <span className="block text-[11px] font-mono-num text-[#696861] uppercase mb-1.5">
                            Quick Add Presets
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                            {[0.5, 1.0, 2.0, 3.0].map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setQuickPreset(preset)}
                                    className={`py-1 px-2 text-xs font-mono-num rounded-[2px] border transition-colors ${parseFloat(hours) === preset
                                        ? "bg-[#282824] border-[#696861] text-[#edebe6]"
                                        : "bg-[#141413] border-[#262624] text-[#9c9a92] hover:border-[#383834] hover:text-[#edebe6]"
                                        }`}
                                >
                                    +{preset}h
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#262624]">
                        <span className="text-xs font-mono-num text-[#9c9a92]">
                            Current total: <strong className="text-[#edebe6]">{currentHours.toFixed(1)}h</strong>
                        </span>
                    </div>

                    {error && (
                        <div className="p-2 text-xs font-mono-num text-[#f87171] bg-[#291617] border border-[#4d2325] rounded-[2px]">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 text-xs font-mono-num text-[#9c9a92] hover:text-[#edebe6] rounded-[2px] border border-[#262624] hover:border-[#383834]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-1.5 text-xs font-mono-num font-semibold bg-[#2e2e2a] hover:bg-[#3d3d37] text-[#edebe6] rounded-[2px] border border-[#4a4a44] transition-colors disabled:opacity-50"
                        >
                            {loading ? "Logging..." : "Log Session"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
