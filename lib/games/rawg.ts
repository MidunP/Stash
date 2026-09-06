import { NormalizedGame, GameSearchResult } from "./types";

const RAWG_BASE_URL = "https://api.rawg.io/api";

// Curated high-quality game metadata fallback for popular titles (used if offline / API key not set)
const FALLBACK_GAMES: NormalizedGame[] = [
    {
        externalId: "rawg-elden-ring",
        title: "Elden Ring",
        slug: "elden-ring",
        coverUrl: "https://media.rawg.io/media/games/b29/b294fdd866dcdbca0377d13920b28435.jpg",
        releaseDate: "2022-02-25",
        releaseYear: 2022,
        description: "THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
        platforms: ["PC", "PlayStation 5", "Xbox Series X/S", "PlayStation 4", "Xbox One"],
    },
    {
        externalId: "rawg-cyberpunk-2077",
        title: "Cyberpunk 2077",
        slug: "cyberpunk-2077",
        coverUrl: "https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c4c59c9c.jpg",
        releaseDate: "2020-12-10",
        releaseYear: 2020,
        description: "Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a Cyberpunk mercenary wrapped in a do-or-die fight for survival.",
        platforms: ["PC", "PlayStation 5", "Xbox Series X/S", "PlayStation 4"],
    },
    {
        externalId: "rawg-baldurs-gate-3",
        title: "Baldur's Gate 3",
        slug: "baldurs-gate-3",
        coverUrl: "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
        releaseDate: "2023-08-03",
        releaseYear: 2023,
        description: "An ancient evil has returned to Baldur's Gate, intent on devouring it from the inside out. The fate of Faerûn lies in your hands. Gather your party and return to the Forgotten Realms.",
        platforms: ["PC", "PlayStation 5", "Xbox Series X/S", "macOS"],
    },
    {
        externalId: "rawg-the-witcher-3-wild-hunt",
        title: "The Witcher 3: Wild Hunt",
        slug: "the-witcher-3-wild-hunt",
        coverUrl: "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
        releaseDate: "2015-05-18",
        releaseYear: 2015,
        description: "You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will.",
        platforms: ["PC", "PlayStation 5", "Xbox Series X/S", "Nintendo Switch", "PlayStation 4"],
    },
    {
        externalId: "rawg-the-legend-of-zelda-tears-of-the-kingdom",
        title: "The Legend of Zelda: Tears of the Kingdom",
        slug: "the-legend-of-zelda-tears-of-the-kingdom",
        coverUrl: "https://media.rawg.io/media/games/cc1/cc196a5ad763955d6b035a78867c2c1c.jpg",
        releaseDate: "2023-05-12",
        releaseYear: 2023,
        description: "An epic adventure awaits across the land and skies of Hyrule in The Legend of Zelda: Tears of the Kingdom.",
        platforms: ["Nintendo Switch"],
    },
    {
        externalId: "rawg-god-of-war-ragnarok",
        title: "God of War Ragnarök",
        slug: "god-of-war-ragnarok",
        coverUrl: "https://media.rawg.io/media/games/f05/f050b44c66c3c52e46b0a0209426f477.jpg",
        releaseDate: "2022-11-09",
        releaseYear: 2022,
        description: "Kratos and Atreus must journey to each of the Nine Realms in search of answers as Asgardian forces prepare for a prophesied battle that will end the world.",
        platforms: ["PlayStation 5", "PlayStation 4", "PC"],
    },
    {
        externalId: "rawg-hollow-knight",
        title: "Hollow Knight",
        slug: "hollow-knight",
        coverUrl: "https://media.rawg.io/media/games/4cf/4cfc9b4185019e39cf05dbf65f0c3f55.jpg",
        releaseDate: "2017-02-24",
        releaseYear: 2017,
        description: "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes.",
        platforms: ["PC", "Nintendo Switch", "PlayStation 4", "Xbox One", "macOS", "Linux"],
    },
    {
        externalId: "rawg-red-dead-redemption-2",
        title: "Red Dead Redemption 2",
        slug: "red-dead-redemption-2",
        coverUrl: "https://media.rawg.io/media/games/511/51182189670d999052b64082260ff0d4.jpg",
        releaseDate: "2018-10-26",
        releaseYear: 2018,
        description: "America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters in the nation massing on their heels.",
        platforms: ["PC", "PlayStation 4", "Xbox One"],
    },
    {
        externalId: "rawg-hades",
        title: "Hades",
        slug: "hades",
        coverUrl: "https://media.rawg.io/media/games/1f4/1f47a55a4931f651941b16dcee8840b2.jpg",
        releaseDate: "2020-09-17",
        releaseYear: 2020,
        description: "Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler from the creators of Bastion and Transistor.",
        platforms: ["PC", "Nintendo Switch", "PlayStation 5", "Xbox Series X/S", "PlayStation 4"],
    },
    {
        externalId: "rawg-persona-5-royal",
        title: "Persona 5 Royal",
        slug: "persona-5-royal",
        coverUrl: "https://media.rawg.io/media/games/a9c/a9c968f9a2636a048a95d7dd7f40cf23.jpg",
        releaseDate: "2019-10-31",
        releaseYear: 2019,
        description: "Don the mask of Joker and join the Phantom Thieves of Hearts as you stage grand heists, infiltrate the minds of the corrupt, and force them to change their ways!",
        platforms: ["PC", "PlayStation 5", "Nintendo Switch", "Xbox Series X/S", "PlayStation 4"],
    },
    {
        externalId: "rawg-gta-v",
        title: "Grand Theft Auto V",
        slug: "grand-theft-auto-v",
        coverUrl: "https://media.rawg.io/media/games/456/456857828e1005900c49165e63a36ee1.jpg",
        releaseDate: "2013-09-17",
        releaseYear: 2013,
        description: "Grand Theft Auto V for PC offers players the option to explore the award-winning world of Los Santos and Blaine County in resolutions up to 4k and beyond.",
        platforms: ["PC", "PlayStation 5", "Xbox Series X/S", "PlayStation 4", "Xbox One"],
    },
    {
        externalId: "rawg-portal-2",
        title: "Portal 2",
        slug: "portal-2",
        coverUrl: "https://media.rawg.io/media/games/328/3283617237d39ce7d70438057a7d4210.jpg",
        releaseDate: "2011-04-18",
        releaseYear: 2011,
        description: "Portal 2 draws from the award-winning formula of innovative gameplay, story, and music that earned the original Portal over 70 industry accolades.",
        platforms: ["PC", "Nintendo Switch", "macOS", "Linux"],
    },
    {
        externalId: "rawg-celeste",
        title: "Celeste",
        slug: "celeste",
        coverUrl: "https://media.rawg.io/media/games/501/501e7019925a3c692bf1c8062f07abd6.jpg",
        releaseDate: "2018-01-25",
        releaseYear: 2018,
        description: "Help Madeline survive her inner demons on her journey to the top of Celeste Mountain, in this super-tight platformer from the creators of TowerFall.",
        platforms: ["PC", "Nintendo Switch", "PlayStation 4", "Xbox One", "macOS", "Linux"],
    },
    {
        externalId: "rawg-black-myth-wukong",
        title: "Black Myth: Wukong",
        slug: "black-myth-wukong",
        coverUrl: "https://media.rawg.io/media/games/9b5/9b5962ca9c5e3170e5b7b9fcf468205f.jpg",
        releaseDate: "2024-08-20",
        releaseYear: 2024,
        description: "Black Myth: Wukong is an action RPG rooted in Chinese mythology. You shall set out as the Destined One to venture into the challenges and marvels ahead.",
        platforms: ["PC", "PlayStation 5"],
    },
    {
        externalId: "rawg-death-stranding",
        title: "Death Stranding",
        slug: "death-stranding",
        coverUrl: "https://media.rawg.io/media/games/214/214b6041413a26400712a9a86d4911d8.jpg",
        releaseDate: "2019-11-08",
        releaseYear: 2019,
        description: "From legendary game creator Hideo Kojima comes an all-new, genre-defying experience. Sam Bridges must brave a world utterly transformed by the Death Stranding.",
        platforms: ["PC", "PlayStation 5", "PlayStation 4"],
    }
];

export async function fetchRawgGames(query: string = ""): Promise<NormalizedGame[]> {
    const apiKey = process.env.RAWG_API_KEY;

    if (apiKey) {
        try {
            const url = `${RAWG_BASE_URL}/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=20`;
            const res = await fetch(url, { next: { revalidate: 3600 } });
            if (res.ok) {
                const data = await res.json();
                if (data.results && Array.isArray(data.results)) {
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
            console.warn("RAWG API fetch error, using fallback matching:", err);
        }
    }

    // Fallback search over curated database
    if (!query.trim()) {
        return FALLBACK_GAMES;
    }

    const q = query.toLowerCase().trim();
    const matched = FALLBACK_GAMES.filter(
        (g) => g.title.toLowerCase().includes(q) || g.platforms.some((p) => p.toLowerCase().includes(q))
    );

    return matched.length > 0 ? matched : FALLBACK_GAMES.slice(0, 6);
}

export async function fetchRawgGameById(externalId: string): Promise<NormalizedGame | null> {
    const apiKey = process.env.RAWG_API_KEY;
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

    const found = FALLBACK_GAMES.find((g) => g.externalId === externalId);
    return found || null;
}
