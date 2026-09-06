import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

const JWT_SECRET = new TextEncoder().encode(
    process.env.SESSION_SECRET || "game-tracker-cinematic-letterboxd-secret-key-2026"
);

const COOKIE_NAME = "gt_session";

export interface SessionPayload {
    userId: string;
    email: string;
    expiresAt: number;
}

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export async function encryptSession(payload: Omit<SessionPayload, "expiresAt">): Promise<string> {
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    return new SignJWT({ ...payload, expiresAt })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET);
}

export async function decryptSession(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET, {
            algorithms: ["HS256"],
        });
        return payload as unknown as SessionPayload;
    } catch {
        return null;
    }
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await decryptSession(token);
}

export async function getCurrentUser() {
    const session = await getSession();
    if (!session?.userId) return null;
    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { id: true, email: true, createdAt: true },
        });
        return user;
    } catch {
        return null;
    }
}

export async function setSessionCookie(userId: string, email: string) {
    const token = await encryptSession({ userId, email });
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });
}

export async function clearSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}
