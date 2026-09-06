import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // 1. Create demo user
    const email = "demo@example.com";
    const passwordHash = await bcrypt.hash("password123", 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            passwordHash,
        },
    });

    console.log("Created demo user:", user.email);

    // 2. Create platforms
    const pc = await prisma.platform.upsert({
        where: { name: "PC" },
        update: {},
        create: { name: "PC" },
    });

    const ps5 = await prisma.platform.upsert({
        where: { name: "PlayStation 5" },
        update: {},
        create: { name: "PlayStation 5" },
    });

    const xbox = await prisma.platform.upsert({
        where: { name: "Xbox Series X/S" },
        update: {},
        create: { name: "Xbox Series X/S" },
    });

    const switchPlat = await prisma.platform.upsert({
        where: { name: "Nintendo Switch" },
        update: {},
        create: { name: "Nintendo Switch" },
    });

    // 3. Create canonical games
    const gamesData = [
        {
            externalId: "rawg-cyberpunk-2077",
            title: "Cyberpunk 2077",
            slug: "cyberpunk-2077",
            coverUrl: "https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c4c59c9c.jpg",
            releaseDate: "2020-12-10",
            releaseYear: 2020,
            description: "Cyberpunk 2077 is an open-world action-adventure RPG set in Night City.",
            platforms: [pc.id, ps5.id, xbox.id],
            userStatus: "PLAYING",
            hoursLogged: 42.5,
            rating: 8.5,
            notes: "Phantom Liberty expansion is phenomenal. Built a full Netrunner build.",
        },
        {
            externalId: "rawg-elden-ring",
            title: "Elden Ring",
            slug: "elden-ring",
            coverUrl: "https://media.rawg.io/media/games/b29/b294fdd866dcdbca0377d13920b28435.jpg",
            releaseDate: "2022-02-25",
            releaseYear: 2022,
            description: "THE NEW FANTASY ACTION RPG by FromSoftware.",
            platforms: [pc.id, ps5.id, xbox.id],
            userStatus: "COMPLETED",
            hoursLogged: 110.0,
            rating: 9.5,
            notes: "Masterpiece world design. Beat Malenia after 40 tries with Strength build.",
        },
        {
            externalId: "rawg-baldurs-gate-3",
            title: "Baldur's Gate 3",
            slug: "baldurs-gate-3",
            coverUrl: "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
            releaseDate: "2023-08-03",
            releaseYear: 2023,
            description: "Gather your party and return to the Forgotten Realms in this legendary RPG.",
            platforms: [pc.id, ps5.id, xbox.id],
            userStatus: "PLAYING",
            hoursLogged: 64.0,
            rating: 9.5,
            notes: "Currently in Act 3. Playing as a Bard Tav with Shadowheart and Karlach.",
        },
        {
            externalId: "rawg-the-legend-of-zelda-tears-of-the-kingdom",
            title: "The Legend of Zelda: Tears of the Kingdom",
            slug: "the-legend-of-zelda-tears-of-the-kingdom",
            coverUrl: "https://media.rawg.io/media/games/cc1/cc196a5ad763955d6b035a78867c2c1c.jpg",
            releaseDate: "2023-05-12",
            releaseYear: 2023,
            description: "An epic adventure across the land and skies of Hyrule.",
            platforms: [switchPlat.id],
            userStatus: "WANT_TO_PLAY",
            hoursLogged: 0.0,
            rating: null,
            notes: "Planning to start right after finishing Baldur's Gate 3.",
        },
        {
            externalId: "rawg-hollow-knight",
            title: "Hollow Knight",
            slug: "hollow-knight",
            coverUrl: "https://media.rawg.io/media/games/4cf/4cfc9b4185019e39cf05dbf65f0c3f55.jpg",
            releaseDate: "2017-02-24",
            releaseYear: 2017,
            description: "Epic action adventure through a vast ruined kingdom of insects.",
            platforms: [pc.id, switchPlat.id],
            userStatus: "COMPLETED",
            hoursLogged: 48.0,
            rating: 9.0,
            notes: "Finished 112% pantheon challenge.",
        },
        {
            externalId: "rawg-hades",
            title: "Hades",
            slug: "hades",
            coverUrl: "https://media.rawg.io/media/games/1f4/1f47a55a4931f651941b16dcee8840b2.jpg",
            releaseDate: "2020-09-17",
            releaseYear: 2020,
            description: "Defy the god of the dead as you hack and slash out of the Underworld.",
            platforms: [pc.id, ps5.id, switchPlat.id],
            userStatus: "COMPLETED",
            hoursLogged: 72.5,
            rating: 9.0,
            notes: "Maxed out affinity with all Olympians and reached Heat 16.",
        },
        {
            externalId: "rawg-god-of-war-ragnarok",
            title: "God of War Ragnarök",
            slug: "god-of-war-ragnarok",
            coverUrl: "https://media.rawg.io/media/games/f05/f050b44c66c3c52e46b0a0209426f477.jpg",
            releaseDate: "2022-11-09",
            releaseYear: 2022,
            description: "Kratos and Atreus journey through each of the Nine Realms.",
            platforms: [ps5.id, pc.id],
            userStatus: "WANT_TO_PLAY",
            hoursLogged: 0.0,
            rating: null,
            notes: null,
        },
        {
            externalId: "rawg-red-dead-redemption-2",
            title: "Red Dead Redemption 2",
            slug: "red-dead-redemption-2",
            coverUrl: "https://media.rawg.io/media/games/511/51182189670d999052b64082260ff0d4.jpg",
            releaseDate: "2018-10-26",
            releaseYear: 2018,
            description: "America, 1899. Arthur Morgan and the Van der Linde gang on the run.",
            platforms: [pc.id, ps5.id],
            userStatus: "ON_HOLD",
            hoursLogged: 32.0,
            rating: 8.5,
            notes: "Paused at Chapter 4 due to slow pacing, will return during winter break.",
        }
    ];

    for (const gData of gamesData) {
        const game = await prisma.game.upsert({
            where: { externalId: gData.externalId },
            update: {},
            create: {
                externalId: gData.externalId,
                title: gData.title,
                slug: gData.slug,
                coverUrl: gData.coverUrl,
                releaseDate: gData.releaseDate,
                releaseYear: gData.releaseYear,
                description: gData.description,
            },
        });

        // Link platforms
        for (const pId of gData.platforms) {
            await prisma.gamePlatform.upsert({
                where: {
                    gameId_platformId: {
                        gameId: game.id,
                        platformId: pId,
                    },
                },
                update: {},
                create: {
                    gameId: game.id,
                    platformId: pId,
                },
            });
        }

        // UserGame entry
        const userGame = await prisma.userGame.upsert({
            where: {
                userId_gameId: {
                    userId: user.id,
                    gameId: game.id,
                },
            },
            update: {
                status: gData.userStatus,
                hoursLogged: gData.hoursLogged,
                rating: gData.rating,
                notes: gData.notes,
            },
            create: {
                userId: user.id,
                gameId: game.id,
                status: gData.userStatus,
                hoursLogged: gData.hoursLogged,
                rating: gData.rating,
                notes: gData.notes,
            },
        });

        // Status History
        const historyCount = await prisma.statusHistory.count({
            where: { userGameId: userGame.id },
        });
        if (historyCount === 0) {
            await prisma.statusHistory.create({
                data: {
                    userGameId: userGame.id,
                    fromStatus: "WANT_TO_PLAY",
                    toStatus: gData.userStatus,
                    changedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            });
        }

        // Play Session if hours > 0
        if (gData.hoursLogged > 0) {
            const sessionCount = await prisma.playSession.count({
                where: { userGameId: userGame.id },
            });
            if (sessionCount === 0) {
                await prisma.playSession.create({
                    data: {
                        userGameId: userGame.id,
                        hours: Math.min(15.0, gData.hoursLogged),
                        playedAt: new Date(),
                    },
                });
            }
        }
    }

    console.log("Database successfully seeded!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
