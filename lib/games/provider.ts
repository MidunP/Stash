import { prisma } from "@/lib/db/prisma";
import { fetchRawgGames, fetchRawgGameById } from "./rawg";
import { NormalizedGame } from "./types";

export async function searchGames(query: string): Promise<NormalizedGame[]> {
    return await fetchRawgGames(query);
}

export async function getGameDetails(externalId: string): Promise<NormalizedGame | null> {
    // First check database cache
    const dbGame = await prisma.game.findUnique({
        where: { externalId },
        include: {
            platforms: {
                include: {
                    platform: true,
                },
            },
        },
    });

    if (dbGame) {
        return {
            externalId: dbGame.externalId,
            title: dbGame.title,
            slug: dbGame.slug,
            coverUrl: dbGame.coverUrl,
            releaseDate: dbGame.releaseDate,
            releaseYear: dbGame.releaseYear,
            description: dbGame.description,
            platforms: dbGame.platforms.map((p) => p.platform.name),
        };
    }

    // Fetch from external API provider
    return await fetchRawgGameById(externalId);
}

export async function getOrCreateDbGame(normalized: NormalizedGame) {
    let game = await prisma.game.findUnique({
        where: { externalId: normalized.externalId },
        include: {
            platforms: {
                include: {
                    platform: true,
                },
            },
        },
    });

    if (!game) {
        game = await prisma.game.create({
            data: {
                externalId: normalized.externalId,
                title: normalized.title,
                slug: normalized.slug,
                coverUrl: normalized.coverUrl,
                releaseDate: normalized.releaseDate,
                releaseYear: normalized.releaseYear,
                description: normalized.description,
            },
            include: {
                platforms: {
                    include: {
                        platform: true,
                    },
                },
            },
        });

        // Create & link platforms
        for (const platformName of normalized.platforms) {
            let platform = await prisma.platform.findUnique({
                where: { name: platformName },
            });
            if (!platform) {
                platform = await prisma.platform.create({
                    data: { name: platformName },
                });
            }
            await prisma.gamePlatform.create({
                data: {
                    gameId: game.id,
                    platformId: platform.id,
                },
            }).catch(() => { }); // Ignore duplicate platform mapping
        }
    }

    return game;
}
