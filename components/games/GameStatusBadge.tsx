import React from "react";

export type GameStatus = "WANT_TO_PLAY" | "PLAYING" | "COMPLETED" | "ON_HOLD" | "DROPPED" | string;

export const STATUS_LABELS: Record<string, string> = {
    WANT_TO_PLAY: "Want to Play",
    PLAYING: "Currently Playing",
    COMPLETED: "Completed",
    ON_HOLD: "On Hold",
    DROPPED: "Dropped",
};

export const STATUS_CLASSES: Record<string, string> = {
    WANT_TO_PLAY: "badge-want",
    PLAYING: "badge-playing",
    COMPLETED: "badge-completed",
    ON_HOLD: "badge-onhold",
    DROPPED: "badge-dropped",
};

interface GameStatusBadgeProps {
    status: GameStatus;
    size?: "sm" | "md";
}

export function GameStatusBadge({ status, size = "md" }: GameStatusBadgeProps) {
    const label = STATUS_LABELS[status] || status;
    const badgeClass = STATUS_CLASSES[status] || "badge-want";
    const sizeClasses = size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs";

    return (
        <span
            className={`inline-flex items-center font-mono-num font-medium rounded-[2px] tracking-wide uppercase ${sizeClasses} ${badgeClass}`}
        >
            {label}
        </span>
    );
}
