"use client";

import React, { useState } from "react";
import { updateGameNotesAndRatingAction } from "@/app/actions/games";
import { Check, Save } from "lucide-react";

import { useToast } from "@/components/ui/Toast";

interface GameNotesAndRatingFormProps {
    userGameId: string;
    initialRating: number | null;
    initialNotes: string | null;
}

export function GameNotesAndRatingForm({
    userGameId,
    initialRating,
    initialNotes,
}: GameNotesAndRatingFormProps) {
    const [rating, setRating] = useState<string>(initialRating ? String(initialRating) : "");
    const [notes, setNotes] = useState<string>(initialNotes || "");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const parsedRating = rating.trim() !== "" ? parseFloat(rating) : null;
        if (parsedRating !== null && (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 10)) {
            setMessage({ text: "Rating must be a number between 1.0 and 10.0", isError: true });
            showToast("Rating must be between 1.0 and 10.0", "error");
            setLoading(false);
            return;
        }

        const res = await updateGameNotesAndRatingAction(userGameId, parsedRating, notes);
        setLoading(false);

        if (res.error) {
            setMessage({ text: res.error, isError: true });
            showToast(res.error, "error");
        } else {
            setMessage({ text: "Saved successfully!" });
            showToast("Notes & Rating saved successfully!", "success");
            setTimeout(() => setMessage(null), 3000);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating Field */}
            <div>
                <label className="block text-xs font-mono-num text-[#696861] uppercase tracking-wider mb-1.5">
                    Personal Rating (1 – 10)
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="10"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        placeholder="e.g. 8.5"
                        className="w-32 bg-[#111110] border border-[#383834] focus:border-[#9c9a92] rounded-[2px] px-3 py-1.5 text-sm font-mono-num text-[#edebe6] focus:outline-none"
                    />
                    <span className="text-xs font-mono-num text-[#9c9a92]">/ 10</span>
                </div>
            </div>

            {/* Multiline Notes */}
            <div>
                <label className="block text-xs font-mono-num text-[#696861] uppercase tracking-wider mb-1.5">
                    Personal Notes & Review
                </label>
                <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write your personal thoughts, strategy notes, or final review..."
                    className="w-full bg-[#111110] border border-[#383834] focus:border-[#9c9a92] rounded-[2px] p-3 text-sm text-[#edebe6] placeholder-[#696861] focus:outline-none font-sans"
                />
            </div>

            {/* Feedback Message */}
            {message && (
                <div
                    className={`p-2.5 text-xs font-mono-num rounded-[2px] flex items-center gap-2 ${message.isError
                        ? "bg-[#291617] border border-[#4d2325] text-[#f87171]"
                        : "bg-[#142419] border border-[#22472d] text-[#4ade80]"
                        }`}
                >
                    {!message.isError && <Check className="w-3.5 h-3.5" />}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Save Action */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-mono-num font-semibold bg-[#2e2e2a] hover:bg-[#3d3d37] text-[#edebe6] border border-[#4a4a44] rounded-[2px] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                    <Save className="w-3.5 h-3.5" />
                    <span>{loading ? "Saving..." : "Save Notes & Rating"}</span>
                </button>
            </div>
        </form>
    );
}
