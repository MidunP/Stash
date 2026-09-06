"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { getGameDetails, getOrCreateDbGame } from "@/lib/games/provider";

export async function addGameToLibraryAction(externalId: string, status: string) {
    const session = await getSession();
    if (!session?.userId) {
        throw new Error("Unauthorized");
    }

    const normalized = await getGameDetails(externalId);
    if (!normalized) {
        throw new Error("Game not found in external provider.");
    }

    // Ensure game exists in local DB
    const game = await getOrCreateDbGame(normalized);

    // Check duplicate
    const existingUserGame = await prisma.userGame.findUnique({
        where: {
            userId_gameId: {
                userId: session.userId,
                gameId: game.id,
            },
        },
    });

    if (existingUserGame) {
        return { error: "This game is already in your library." };
    }

    // Create user game record
    const userGame = await prisma.userGame.create({
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
    });

    revalidatePath("/playing");
    revalidatePath("/watchlist");
    revalidatePath("/library");
    revalidatePath("/stats");
    revalidatePath("/search");

    return { success: true, userGameId: userGame.id };
}

export async function updateGameStatusAction(userGameId: string, newStatus: string) {
    const session = await getSession();
    if (!session?.userId) {
        throw new Error("Unauthorized");
    }

    const userGame = await prisma.userGame.findFirst({
        where: {
            id: userGameId,
            userId: session.userId, // Ownership check
        },
    });

    if (!userGame) {
        throw new Error("Game entry not found.");
    }

    if (userGame.status === newStatus) {
        return { success: true };
    }

    const oldStatus = userGame.status;

    await prisma.$transaction([
        prisma.userGame.update({
            where: { id: userGameId },
            data: {
                status: newStatus,
                updatedAt: new Date(),
            },
        }),
        prisma.statusHistory.create({
            data: {
                userGameId,
                fromStatus: oldStatus,
                toStatus: newStatus,
            },
        }),
    ]);

    revalidatePath("/playing");
    revalidatePath("/watchlist");
    revalidatePath("/library");
    revalidatePath("/stats");
    revalidatePath(`/game/${userGame.gameId}`);

    return { success: true };
}

export async function logPlaySessionAction(userGameId: string, hours: number) {
    const session = await getSession();
    if (!session?.userId) {
        throw new Error("Unauthorized");
    }

    if (isNaN(hours) || hours <= 0) {
        return { error: "Please enter a valid positive number of hours." };
    }

    const userGame = await prisma.userGame.findFirst({
        where: {
            id: userGameId,
            userId: session.userId, // Ownership check
        },
    });

    if (!userGame) {
        return { error: "Game entry not found." };
    }

    const updatedHours = Number((userGame.hoursLogged + hours).toFixed(1));

    await prisma.$transaction([
        prisma.userGame.update({
            where: { id: userGameId },
            data: {
                hoursLogged: updatedHours,
                updatedAt: new Date(),
            },
        }),
        prisma.playSession.create({
            data: {
                userGameId,
                hours: Number(hours.toFixed(1)),
                playedAt: new Date(),
            },
        }),
    ]);

    revalidatePath("/playing");
    revalidatePath("/library");
    revalidatePath("/stats");
    revalidatePath(`/game/${userGame.gameId}`);

    return { success: true, newTotalHours: updatedHours };
}

export async function updateGameNotesAndRatingAction(userGameId: string, rating: number | null, notes: string) {
    const session = await getSession();
    if (!session?.userId) {
        throw new Error("Unauthorized");
    }

    const userGame = await prisma.userGame.findFirst({
        where: {
            id: userGameId,
            userId: session.userId,
        },
    });

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

    await prisma.userGame.update({
        where: { id: userGameId },
        data: {
            rating: sanitizedRating,
            notes: notes ? notes.trim() : null,
            updatedAt: new Date(),
        },
    });

    revalidatePath("/library");
    revalidatePath(`/game/${userGame.gameId}`);

    return { success: true };
}

export async function removeUserGameAction(userGameId: string) {
    const session = await getSession();
    if (!session?.userId) {
        throw new Error("Unauthorized");
    }

    const userGame = await prisma.userGame.findFirst({
        where: {
            id: userGameId,
            userId: session.userId,
        },
    });

    if (!userGame) {
        return { error: "Game entry not found." };
    }

    await prisma.userGame.delete({
        where: { id: userGameId },
    });

    revalidatePath("/playing");
    revalidatePath("/watchlist");
    revalidatePath("/library");
    revalidatePath("/stats");

    return { success: true };
}
