import { NormalizedGame } from "./types";

const RAWG_BASE_URL = "https://api.rawg.io/api";

// Curated high-quality game metadata fallback for popular titles (using verified 200 OK poster URLs)
const FALLBACK_GAMES: NormalizedGame[] = [
    {
        externalId: "rawg-elden-ring",
        title: "Elden Ring",
        slug: "elden-ring",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900_2x.jpg",
        releaseDate: "2022-02-25",
        releaseYear: 2022,
        description: "THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
        platforms: ["PC", "PlayStation 5", "Xbox Series X/S", "PlayStation 4", "Xbox One"],
    },
    {
        externalId: "rawg-cyberpunk-2077",
        title: "Cyberpunk 2077",
        slug: "cyberpunk-2077",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900_2x.jpg",
        releaseDate: "2020-12-10",
        releaseYear: 2020,
        description: "Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a Cyberpunk mercenary wrapped in a do-or-die fight for survival.",
        platforms: ["PC", "PlayStation 5", "Xbox Series X/S", "PlayStation 4"],
    },
    {
        externalId: "rawg-baldurs-gate-3",
        title: "Baldur's Gate 3",
        slug: "baldurs-gate-3",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900_2x.jpg",
        releaseDate: "2023-08-03",
        releaseYear: 2023,
        description: "An ancient evil has returned to Baldur's Gate, intent on devouring it from the inside out. The fate of Faerûn lies in your hands. Gather your party and return to the Forgotten Realms.",
        platforms: ["PC", "PlayStation 5", "Xbox Series X/S", "macOS"],
    },
    {
        externalId: "rawg-the-witcher-3-wild-hunt",
        title: "The Witcher 3: Wild Hunt",
        slug: "the-witcher-3-wild-hunt",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900_2x.jpg",
        releaseDate: "2015-05-18",
        releaseYear: 2015,
        description: "You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will.",
        platforms: ["PC", "PlayStation 5", "Xbox Series X/S", "Nintendo Switch", "PlayStation 4"],
    },
    {
        externalId: "rawg-the-legend-of-zelda-tears-of-the-kingdom",
        title: "The Legend of Zelda: Tears of the Kingdom",
        slug: "the-legend-of-zelda-tears-of-the-kingdom",
        coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
        releaseDate: "2023-05-12",
        releaseYear: 2023,
        description: "An epic adventure awaits across the land and skies of Hyrule in The Legend of Zelda: Tears of the Kingdom.",
        platforms: ["Nintendo Switch"],
    },
    {
        externalId: "rawg-god-of-war-ragnarok",
        title: "God of War Ragnarök",
        slug: "god-of-war-ragnarok",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/library_600x900_2x.jpg",
        releaseDate: "2022-11-09",
        releaseYear: 2022,
        description: "Kratos and Atreus must journey to each of the Nine Realms in search of answers as Asgardian forces prepare for a prophesied battle that will end the world.",
        platforms: ["PlayStation 5", "PlayStation 4", "PC"],
    },
    {
        externalId: "rawg-hollow-knight",
        title: "Hollow Knight",
        slug: "hollow-knight",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/library_600x900_2x.jpg",
        releaseDate: "2017-02-24",
        releaseYear: 2017,
        description: "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes.",
        platforms: ["PC", "Nintendo Switch", "PlayStation 4", "Xbox One", "macOS", "Linux"],
    },
    {
        externalId: "rawg-red-dead-redemption-2",
        title: "Red Dead Redemption 2",
        slug: "red-dead-redemption-2",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172470/library_600x900_2x.jpg",
        releaseDate: "2018-10-26",
        releaseYear: 2018,
        description: "America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters in the nation massing on their heels.",
        platforms: ["PC", "PlayStation 4", "Xbox One"],
    },
    {
        externalId: "rawg-hades",
        title: "Hades",
        slug: "hades",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/library_600x900_2x.jpg",
        releaseDate: "2020-09-17",
        releaseYear: 2020,
        description: "Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler from the creators of Bastion and Transistor.",
        platforms: ["PC", "Nintendo Switch", "PlayStation 5", "Xbox Series X/S", "PlayStation 4"],
    },
    {
        externalId: "rawg-persona-5-royal",
        title: "Persona 5 Royal",
        slug: "persona-5-royal",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1687950/library_600x900_2x.jpg",
        releaseDate: "2019-10-31",
        releaseYear: 2019,
        description: "Don the mask of Joker and join the Phantom Thieves of Hearts as you stage grand heists, infiltrate the minds of the corrupt, and force them to change their ways!",
        platforms: ["PC", "PlayStation 5", "Nintendo Switch", "Xbox Series X/S", "PlayStation 4"],
    },
    {
        externalId: "rawg-gta-v",
        title: "Grand Theft Auto V",
        slug: "grand-theft-auto-v",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900_2x.jpg",
        releaseDate: "2013-09-17",
        releaseYear: 2013,
        description: "Grand Theft Auto V for PC offers players the option to explore the award-winning world of Los Santos and Blaine County in resolutions up to 4k and beyond.",
        platforms: ["PC", "PlayStation 5", "Xbox Series X/S", "PlayStation 4", "Xbox One"],
    },
    {
        externalId: "rawg-portal-2",
        title: "Portal 2",
        slug: "portal-2",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/620/library_600x900_2x.jpg",
        releaseDate: "2011-04-18",
        releaseYear: 2011,
        description: "Portal 2 draws from the award-winning formula of innovative gameplay, story, and music that earned the original Portal over 70 industry accolades.",
        platforms: ["PC", "Nintendo Switch", "macOS", "Linux"],
    },
    {
        externalId: "rawg-celeste",
        title: "Celeste",
        slug: "celeste",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/library_600x900_2x.jpg",
        releaseDate: "2018-01-25",
        releaseYear: 2018,
        description: "Help Madeline survive her inner demons on her journey to the top of Celeste Mountain, in this super-tight platformer from the creators of TowerFall.",
        platforms: ["PC", "Nintendo Switch", "PlayStation 4", "Xbox One", "macOS", "Linux"],
    },
    {
        externalId: "rawg-black-myth-wukong",
        title: "Black Myth: Wukong",
        slug: "black-myth-wukong",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/library_600x900_2x.jpg",
        releaseDate: "2024-08-20",
        releaseYear: 2024,
        description: "Black Myth: Wukong is an action RPG rooted in Chinese mythology. You shall set out as the Destined One to venture into the challenges and marvels ahead.",
        platforms: ["PC", "PlayStation 5"],
    },
    {
        externalId: "rawg-death-stranding",
        title: "Death Stranding",
        slug: "death-stranding",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1850570/library_600x900_2x.jpg",
        releaseDate: "2019-11-08",
        releaseYear: 2019,
        description: "From legendary game creator Hideo Kojima comes an all-new, genre-defying experience. Sam Bridges must brave a world utterly transformed by the Death Stranding.",
        platforms: ["PC", "PlayStation 5", "PlayStation 4"],
    }
];

// Secondary free game search via CheapShark & Steam API (always works without API key)
async function fetchCheapSharkGames(query: string): Promise<NormalizedGame[]> {
    try {
        const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
        const url = `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(query)}`;
        const res = await fetch(url, { headers, next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                return data.map((g: any) => {
                    const steamAppId = g.steamAppID;
                    const coverUrl = steamAppId
                        ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${steamAppId}/library_600x900_2x.jpg`
                        : (g.thumb || null);
                    return {
                        externalId: `cs-${g.gameID}`,
                        title: g.external || "Untitled Game",
                        slug: (g.external || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                        coverUrl,
                        releaseDate: null,
                        releaseYear: null,
                        description: "Available on PC and gaming platforms.",
                        platforms: ["PC"],
                    };
                });
            }
        }
    } catch (err) {
        console.warn("CheapShark fetch error:", err);
    }
    return [];
}

export async function fetchRawgGames(query: string = ""): Promise<NormalizedGame[]> {
    const apiKey = process.env.RAWG_API_KEY;

    // 1. Try RAWG API if key is present
    if (apiKey && apiKey.trim().length > 0) {
        try {
            const url = `${RAWG_BASE_URL}/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=20`;
            const res = await fetch(url, { next: { revalidate: 3600 } });
            if (res.ok) {
                const data = await res.json();
                if (data.results && Array.isArray(data.results) && data.results.length > 0) {
                    return data.results.map((g: any) => ({
                        externalId: `rawg-${g.id}`,
                        title: g.name || "Untitled Game",
                        slug: g.slug || String(g.id),
                        coverUrl: g.background_image || null,
                        releaseDate: g.released || null,
                        releaseYear: g.released ? new Date(g.released).getFullYear() : null,
                        description: null,
                        platforms: g.platforms ? g.platforms.map((p: any) => p.platform?.name).filter(Boolean) : [],
                    }));
                }
            }
        } catch (err) {
            console.warn("RAWG API fetch error, falling back:", err);
        }
    }

    // 2. If searching and RAWG API key not present or returned nothing, try CheapShark + Steam API
    if (query.trim().length > 0) {
        const csResults = await fetchCheapSharkGames(query);
        if (csResults.length > 0) {
            return csResults;
        }

        // Search over curated list
        const q = query.toLowerCase().trim();
        const matched = FALLBACK_GAMES.filter(
            (g) => g.title.toLowerCase().includes(q) || g.platforms.some((p) => p.toLowerCase().includes(q))
        );
        if (matched.length > 0) return matched;
    }

    return FALLBACK_GAMES;
}

export async function fetchRawgGameById(externalId: string): Promise<NormalizedGame | null> {
    const apiKey = process.env.RAWG_API_KEY;

    // First check fallback games
    const foundFallback = FALLBACK_GAMES.find((g) => g.externalId === externalId);
    if (foundFallback) return foundFallback;

    // Check RAWG ID
    if (externalId.startsWith("rawg-")) {
        const rawId = externalId.replace(/^rawg-/, "");
        if (apiKey && !isNaN(Number(rawId))) {
            try {
                const url = `${RAWG_BASE_URL}/games/${rawId}?key=${apiKey}`;
                const res = await fetch(url, { next: { revalidate: 86400 } });
                if (res.ok) {
                    const g = await res.json();
                    return {
                        externalId: `rawg-${g.id}`,
                        title: g.name || "Untitled Game",
                        slug: g.slug || String(g.id),
                        coverUrl: g.background_image || null,
                        releaseDate: g.released || null,
                        releaseYear: g.released ? new Date(g.released).getFullYear() : null,
                        description: g.description_raw || g.description || null,
                        platforms: g.platforms ? g.platforms.map((p: any) => p.platform?.name).filter(Boolean) : [],
                    };
                }
            } catch (err) {
                console.warn("RAWG Game details fetch error:", err);
            }
        }
    }

    // Check CheapShark ID
    if (externalId.startsWith("cs-")) {
        const csId = externalId.replace(/^cs-/, "");
        try {
            const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
            const url = `https://www.cheapshark.com/api/1.0/games?id=${csId}`;
            const res = await fetch(url, { headers, next: { revalidate: 86400 } });
            if (res.ok) {
                const data = await res.json();
                if (data.info) {
                    const steamAppId = data.info.steamAppID;
                    const coverUrl = steamAppId
                        ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${steamAppId}/library_600x900_2x.jpg`
                        : (data.info.thumb || null);
                    return {
                        externalId: `cs-${csId}`,
                        title: data.info.title || "Untitled Game",
                        slug: (data.info.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                        coverUrl,
                        releaseDate: null,
                        releaseYear: null,
                        description: "Available on PC and major gaming platforms.",
                        platforms: ["PC"],
                    };
                }
            }
        } catch (err) {
            console.warn("CheapShark lookup error:", err);
        }
    }

    return null;
}

