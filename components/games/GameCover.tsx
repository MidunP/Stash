"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";

interface GameCoverProps {
    title: string;
    coverUrl?: string | null;
    className?: string;
    aspectRatio?: string;
}

export function GameCover({ title, coverUrl, className = "w-12 h-16", aspectRatio = "aspect-[3/4]" }: GameCoverProps) {
    const [error, setError] = useState(false);

    if (!coverUrl || error) {
        return (
            <div
                className={`bg-[#1e1e1c] border border-[#2b2b27] rounded-[2px] flex flex-col items-center justify-center text-[#696861] p-1 text-center select-none overflow-hidden shrink-0 ${className} ${aspectRatio}`}
                title={title}
            >
                <Gamepad2 className="w-4 h-4 mb-0.5 opacity-50 stroke-1" />
                <span className="text-[9px] font-heading font-semibold uppercase leading-tight line-clamp-2 text-[#9c9a92]">
                    {title}
                </span>
            </div>
        );
    }

    return (
        <div className={`relative bg-[#1a1a18] border border-[#262624] rounded-[2px] overflow-hidden shrink-0 ${className} ${aspectRatio}`}>
            <img
                src={coverUrl}
                alt={title}
                onError={() => setError(true)}
                className="w-full h-full object-cover"
                loading="lazy"
            />
        </div>
    );
}
