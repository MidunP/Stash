"use server";

import { revalidatePath } from "next/cache";
import { prisma, withDbRetry } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { getGameDetails, getOrCreateDbGame } from "@/lib/games/provider";

export async function addGameToLibraryAction(externalId: string, status: string) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: "You must be logged in to add games." };
    }

    try {
        const normalized = await getGameDetails(externalId);
        if (!normalized) {
            return { error: "Game not found in external provider." };
        }

        // Ensure game exists in local DB
        const game = await getOrCreateDbGame(normalized);

        // Check duplicate
        const existingUserGame = await withDbRetry((db) =>
            db.userGame.findUnique({
                where: {
                    userId_gameId: {
                        userId: session.userId,
                        gameId: game.id,
                    },
                },
            })
        );

        if (existingUserGame) {
            return { error: "This game is already in your library." };
        }

        // Create user game record
        const userGame = await withDbRetry((db) =>
            db.userGame.create({
                data: {
                    userId: session.userId,
                    gameId: game.id,
                    status: status || "WANT_TO_PLAY",
                    hoursLogged: 0,
                    statusHistory: {
                        create: {
                            fromStatus: null,
                            toStatus: status || "WANT_TO_PLAY",
                        },
                    },
                },
            })
        );

        revalidatePath("/playing");
        revalidatePath("/watchlist");
        revalidatePath("/library");
        revalidatePath("/stats");
        revalidatePath("/search");

        return { success: true, userGameId: userGame.id };
    } catch (err: unknown) {
        console.error("[addGameToLibraryAction] Error:", err);
        const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
        if (msg.includes("timeout") || msg.includes("connect") || msg.includes("p2024") || msg.includes("p1001")) {
            return { error: "Database is waking up. Please try again in a moment." };
        }
        return { error: "Failed to add game. Please try again." };
    }
}

export async function updateGameStatusAction(userGameId: string, newStatus: string) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: "Unauthorized" };
    }

    try {
        const userGame = await withDbRetry((db) =>
            db.userGame.findFirst({
                where: { id: userGameId, userId: session.userId },
            })
        );

        if (!userGame) {
            return { error: "Game entry not found." };
        }

        if (userGame.status === newStatus) {
            return { success: true };
        }

        const oldStatus = userGame.status;

        await withDbRetry((db) =>
            db.$transaction([
                db.userGame.update({
                    where: { id: userGameId },
                    data: { status: newStatus, updatedAt: new Date() },
                }),
                db.statusHistory.create({
                    data: { userGameId, fromStatus: oldStatus, toStatus: newStatus },
                }),
            ])
        );

        revalidatePath("/playing");
        revalidatePath("/watchlist");
        revalidatePath("/library");
        revalidatePath("/stats");
        revalidatePath(`/game/${userGame.gameId}`);

        return { success: true };
    } catch (err: unknown) {
        console.error("[updateGameStatusAction] Error:", err);
        return { error: "Failed to update status. Please try again." };
    }
}

export async function logPlaySessionAction(userGameId: string, hours: number) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: "Unauthorized" };
    }

    if (isNaN(hours) || hours <= 0) {
        return { error: "Please enter a valid positive number of hours." };
    }

    try {
        const userGame = await withDbRetry((db) =>
            db.userGame.findFirst({
                where: { id: userGameId, userId: session.userId },
            })
        );

        if (!userGame) {
            return { error: "Game entry not found." };
        }

        const updatedHours = Number((userGame.hoursLogged + hours).toFixed(1));

        await withDbRetry((db) =>
            db.$transaction([
                db.userGame.update({
                    where: { id: userGameId },
                    data: { hoursLogged: updatedHours, updatedAt: new Date() },
                }),
                db.playSession.create({
                    data: {
                        userGameId,
                        hours: Number(hours.toFixed(1)),
                        playedAt: new Date(),
                    },
                }),
            ])
        );

        revalidatePath("/playing");
        revalidatePath("/library");
        revalidatePath("/stats");
        revalidatePath(`/game/${userGame.gameId}`);

        return { success: true, newTotalHours: updatedHours };
    } catch (err: unknown) {
        console.error("[logPlaySessionAction] Error:", err);
        return { error: "Failed to log session. Please try again." };
    }
}

export async function updateGameNotesAndRatingAction(userGameId: string, rating: number | null, notes: string) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: "Unauthorized" };
    }

    try {
        const userGame = await withDbRetry((db) =>
            db.userGame.findFirst({
                where: { id: userGameId, userId: session.userId },
            })
        );

        if (!userGame) {
            return { error: "Game entry not found." };
        }

        let sanitizedRating: number | null = null;
        if (rating !== null && !isNaN(rating)) {
            if (rating < 1 || rating > 10) {
                return { error: "Rating must be between 1 and 10." };
            }
            sanitizedRating = Number(rating.toFixed(1));
        }

        await withDbRetry((db) =>
            db.userGame.update({
                where: { id: userGameId },
                data: {
                    rating: sanitizedRating,
                    notes: notes ? notes.trim() : null,
                    updatedAt: new Date(),
                },
            })
        );

        revalidatePath("/library");
        revalidatePath(`/game/${userGame.gameId}`);

        return { success: true };
    } catch (err: unknown) {
        console.error("[updateGameNotesAndRatingAction] Error:", err);
        return { error: "Failed to save changes. Please try again." };
    }
}

export async function removeUserGameAction(userGameId: string) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: "Unauthorized" };
    }

    try {
        const userGame = await withDbRetry((db) =>
            db.userGame.findFirst({
                where: { id: userGameId, userId: session.userId },
            })
        );

        if (!userGame) {
            return { error: "Game entry not found." };
        }

        await withDbRetry((db) =>
            db.userGame.delete({ where: { id: userGameId } })
        );

        revalidatePath("/playing");
        revalidatePath("/watchlist");
        revalidatePath("/library");
        revalidatePath("/stats");

        return { success: true };
    } catch (err: unknown) {
        console.error("[removeUserGameAction] Error:", err);
        return { error: "Failed to remove game. Please try again." };
    }
}

export async function exportUserLibraryAction() {
    const session = await getSession();
    if (!session?.userId) {
        throw new Error("Unauthorized");
    }

    const userGames = await withDbRetry((db) =>
        db.userGame.findMany({
            where: { userId: session.userId },
            include: {
                game: {
                    include: {
                        platforms: {
                            include: { platform: true },
                        },
                    },
                },
                statusHistory: true,
                playSessions: true,
            },
        })
    );

    const exportData = userGames.map((ug) => ({
        externalId: ug.game.externalId,
        title: ug.game.title,
        slug: ug.game.slug,
        coverUrl: ug.game.coverUrl,
        releaseYear: ug.game.releaseYear,
        description: ug.game.description,
        platforms: ug.game.platforms.map((p) => p.platform.name),
        status: ug.status,
        hoursLogged: ug.hoursLogged,
        rating: ug.rating,
        notes: ug.notes,
        dateAdded: ug.dateAdded,
        updatedAt: ug.updatedAt,
    }));

    return { success: true, data: exportData };
}

export async function importUserLibraryAction(items: any[]) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: "Unauthorized" };
    }

    if (!Array.isArray(items) || items.length === 0) {
        return { error: "Invalid import format. Expected array of game entries." };
    }

    let importedCount = 0;
    let skippedCount = 0;

    for (const item of items) {
        if (!item.title || !item.externalId) {
            skippedCount++;
            continue;
        }

        try {
            const normalized = {
                externalId: String(item.externalId),
                title: String(item.title),
                slug: item.slug ? String(item.slug) : String(item.title).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                coverUrl: item.coverUrl || null,
                releaseDate: item.releaseDate || null,
                releaseYear: item.releaseYear ? Number(item.releaseYear) : null,
                description: item.description || null,
                platforms: Array.isArray(item.platforms) ? item.platforms : [],
            };

            const dbGame = await getOrCreateDbGame(normalized);

            const existing = await withDbRetry((db) =>
                db.userGame.findUnique({
                    where: {
                        userId_gameId: {
                            userId: session.userId,
                            gameId: dbGame.id,
                        },
                    },
                })
            );

            if (existing) {
                skippedCount++;
                continue;
            }

            await withDbRetry((db) =>
                db.userGame.create({
                    data: {
                        userId: session.userId,
                        gameId: dbGame.id,
                        status: item.status || "WANT_TO_PLAY",
                        hoursLogged: typeof item.hoursLogged === "number" ? item.hoursLogged : 0,
                        rating: typeof item.rating === "number" ? item.rating : null,
                        notes: item.notes || null,
                        statusHistory: {
                            create: {
                                fromStatus: null,
                                toStatus: item.status || "WANT_TO_PLAY",
                            },
                        },
                    },
                })
            );

            importedCount++;
        } catch (err) {
            console.error("Error importing item:", item, err);
            skippedCount++;
        }
    }

    revalidatePath("/playing");
    revalidatePath("/watchlist");
    revalidatePath("/library");
    revalidatePath("/stats");

    return { success: true, importedCount, skippedCount };
}
