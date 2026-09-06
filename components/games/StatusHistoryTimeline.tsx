import React from "react";
import { STATUS_LABELS } from "./GameStatusBadge";

export interface StatusHistoryItem {
    id: string;
    fromStatus: string | null;
    toStatus: string;
    changedAt: string | Date;
}

interface StatusHistoryTimelineProps {
    history: StatusHistoryItem[];
}

export function StatusHistoryTimeline({ history }: StatusHistoryTimelineProps) {
    if (!history || history.length === 0) {
        return (
            <p className="text-xs font-mono-num text-[#696861] italic">
                No status history recorded.
            </p>
        );
    }

    // Sort descending (latest first)
    const sorted = [...history].sort(
        (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    );

    return (
        <div className="space-y-4 font-mono-num text-xs">
            {sorted.map((item) => {
                const dateStr = new Date(item.changedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });

                const toLabel = STATUS_LABELS[item.toStatus] || item.toStatus;
                const fromLabel = item.fromStatus ? STATUS_LABELS[item.fromStatus] || item.fromStatus : null;

                return (
                    <div key={item.id} className="border-l-2 border-[#383834] pl-3 py-0.5 space-y-0.5">
                        <div className="text-[#9c9a92] text-[11px] font-semibold">{dateStr}</div>
                        <div className="text-[#edebe6] font-semibold text-sm">{toLabel}</div>
                        <div className="text-[#696861] text-[11px]">
                            {fromLabel ? `Moved from ${fromLabel}` : "Added to library"}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
