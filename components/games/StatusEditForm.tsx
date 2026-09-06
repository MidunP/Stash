"use client";

import React, { useState } from "react";
import { updateGameStatusAction } from "@/app/actions/games";
import { STATUS_LABELS } from "./GameStatusBadge";

import { useToast } from "@/components/ui/Toast";

interface StatusEditFormProps {
    userGameId: string;
    currentStatus: string;
}

export function StatusEditForm({ userGameId, currentStatus }: StatusEditFormProps) {
    const [status, setStatus] = useState(currentStatus);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === status || loading) return;
        setStatus(newStatus);
        setLoading(true);
        try {
            await updateGameStatusAction(userGameId, newStatus);
            showToast(`Status updated to ${STATUS_LABELS[newStatus] || newStatus}`, "success");
        } catch (err) {
            console.error("Status update error:", err);
            showToast("Failed to update status", "error");
        } finally {
            setLoading(false);
        }
    };


    const options = [
        { value: "PLAYING", label: STATUS_LABELS.PLAYING },
        { value: "WANT_TO_PLAY", label: STATUS_LABELS.WANT_TO_PLAY },
        { value: "COMPLETED", label: STATUS_LABELS.COMPLETED },
        { value: "ON_HOLD", label: STATUS_LABELS.ON_HOLD },
        { value: "DROPPED", label: STATUS_LABELS.DROPPED },
    ];

    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-mono-num text-[#696861] uppercase tracking-wider">
                Library Status
            </label>
            <div className="flex flex-wrap gap-1.5 font-mono-num text-xs">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        disabled={loading}
                        onClick={() => handleStatusChange(opt.value)}
                        className={`px-3 py-1.5 rounded-[2px] border transition-colors uppercase font-medium ${status === opt.value
                            ? "bg-[#282824] border-[#696861] text-[#edebe6]"
                            : "bg-[#141413] border-[#222220] text-[#9c9a92] hover:border-[#383834] hover:text-[#edebe6]"
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
