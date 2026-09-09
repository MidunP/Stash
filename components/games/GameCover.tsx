"use client";

import React, { useState, useEffect } from "react";
import { Gamepad2 } from "lucide-react";

interface GameCoverProps {
    title: string;
    coverUrl?: string | null;
    className?: string;
    aspectRatio?: string;
}

const KNOWN_POSTERS: Record<string, string> = {
    "elden ring": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900_2x.jpg",
    "cyberpunk 2077": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900_2x.jpg",
    "baldur's gate 3": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900_2x.jpg",
    "the witcher 3: wild hunt": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900_2x.jpg",
    "the legend of zelda: tears of the kingdom": "https://upload.wikimedia.org/wikipedia/en/f/fb/The_Legend_of_Zelda_Tears_of_the_Kingdom_cover.jpg",
    "god of war ragnarök": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/library_600x900_2x.jpg",
    "god of war ragnarok": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/library_600x900_2x.jpg",
    "hollow knight": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/library_600x900_2x.jpg",
    "red dead redemption 2": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172470/library_600x900_2x.jpg",
    "hades": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/library_600x900_2x.jpg",
    "persona 5 royal": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1687950/library_600x900_2x.jpg",
    "grand theft auto v": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900_2x.jpg",
    "portal 2": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/620/library_600x900_2x.jpg",
    "celeste": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/library_600x900_2x.jpg",
    "black myth: wukong": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/library_600x900_2x.jpg",
    "death stranding": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1850570/library_600x900_2x.jpg",
};

export function resolveGameCover(title: string, coverUrl?: string | null): string | null {
    const normalized = title.toLowerCase().trim();
    if (KNOWN_POSTERS[normalized]) {
        return KNOWN_POSTERS[normalized];
    }
    if (!coverUrl || coverUrl.includes("media.rawg.io")) {
        return null;
    }
    return coverUrl;
}

export function GameCover({ title, coverUrl, className = "w-12 h-16", aspectRatio = "aspect-[3/4]" }: GameCoverProps) {
    const initialUrl = resolveGameCover(title, coverUrl);
    const [imgSrc, setImgSrc] = useState<string | null>(initialUrl);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const resolved = resolveGameCover(title, coverUrl);
        setImgSrc(resolved);
        setFailed(false);
    }, [title, coverUrl]);

    const handleError = () => {
        setFailed(true);
    };

    if (!imgSrc || failed) {
        // High quality fallback game poster layout with dark cinematic gradient
        return (
            <div
                className={`relative bg-gradient-to-b from-[#2a2a26] via-[#1a1a18] to-[#121211] border border-[#33332e] rounded-[2px] flex flex-col items-center justify-between p-1.5 text-center select-none overflow-hidden shrink-0 shadow-md ${className} ${aspectRatio}`}
                title={title}
            >
                <div className="w-full flex items-center justify-between opacity-60">
                    <span className="text-[7px] font-mono-num text-[#9c9a92] tracking-wider uppercase">GAME</span>
                    <Gamepad2 className="w-3 h-3 text-[#f59e0b] opacity-80" />
                </div>
                <div className="my-auto px-0.5">
                    <span className="text-[10px] sm:text-xs font-heading font-bold uppercase leading-tight line-clamp-3 text-[#edebe6] tracking-wide">
                        {title}
                    </span>
                </div>
                <div className="w-full h-0.5 bg-gradient-to-r from-amber-500/40 via-amber-400 to-amber-500/40 rounded-full opacity-60" />
            </div>
        );
    }

    return (
        <div className={`relative bg-[#1a1a18] border border-[#262624] rounded-[2px] overflow-hidden shrink-0 shadow-md group ${className} ${aspectRatio}`}>
            <img
                src={imgSrc}
                alt=""
                onError={handleError}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
            />
        </div>
    );
}

