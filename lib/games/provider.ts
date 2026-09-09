import { prisma } from "@/lib/db/prisma";
import { fetchRawgGames, fetchRawgGameById } from "./rawg";
import { NormalizedGame } from "./types";

export async function searchGames(query: string): Promise<NormalizedGame[]> {
    return await fetchRawgGames(query);
}

export async function getGameDetails(externalId: string): Promise<NormalizedGame | null> {
    const external = await fetchRawgGameById(externalId);

    // Check database cache
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
        // If DB has broken media.rawg.io link or missing coverUrl, update with external clean URL
        let coverUrl = dbGame.coverUrl;
        if ((!coverUrl || coverUrl.includes("media.rawg.io")) && external?.coverUrl) {
            coverUrl = external.coverUrl;
            await prisma.game.update({
                where: { id: dbGame.id },
                data: { coverUrl },
            }).catch(() => { });
        }

        return {
            externalId: dbGame.externalId,
            title: dbGame.title,
            slug: dbGame.slug,
            coverUrl: coverUrl || external?.coverUrl || null,
            releaseDate: dbGame.releaseDate,
            releaseYear: dbGame.releaseYear,
            description: dbGame.description || external?.description || null,
            platforms: dbGame.platforms.length > 0 ? dbGame.platforms.map((p) => p.platform.name) : (external?.platforms || []),
        };
    }

    // Fetch from external API provider
    return external;
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
    } else if ((!game.coverUrl || game.coverUrl.includes("media.rawg.io")) && normalized.coverUrl) {
        // Upgrade existing game coverUrl if broken
        game = await prisma.game.update({
            where: { id: game.id },
            data: { coverUrl: normalized.coverUrl },
            include: {
                platforms: {
                    include: {
                        platform: true,
                    },
                },
            },
        });
    }

    return game;
}

