"use server";

import { redirect } from "next/navigation";
import { prisma, withDbRetry } from "@/lib/db/prisma";
import { hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, getSession } from "@/lib/auth/session";

export interface AuthState {
    error?: string;
    success?: boolean;
}

export async function loginAction(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
        return { error: "Please provide both email and password." };
    }

    try {
        const user = await withDbRetry((db) =>
            db.user.findUnique({
                where: { email: email.toLowerCase() },
            })
        );

        if (!user) {
            return { error: "Invalid email or password." };
        }

        const passwordValid = await verifyPassword(password, user.passwordHash);
        if (!passwordValid) {
            return { error: "Invalid email or password." };
        }

        await setSessionCookie(user.id, user.email);
    } catch (err: any) {
        console.error("Login error:", err);
        const msg = err?.message || "";
        if (msg.includes("DATABASE_URL") || msg.includes("PrismaClient") || msg.includes("connect") || msg.includes("reach")) {
            return { error: "Database connection failed or timed out. Please wait a moment for the database to wake up and try again." };
        }
        return { error: err?.message || "An unexpected error occurred. Please try again." };
    }

    redirect("/playing");
}

export async function signupAction(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!email || !password || !confirmPassword) {
        return { error: "Please fill in all fields." };
    }

    if (password.length < 6) {
        return { error: "Password must be at least 6 characters long." };
    }

    if (password !== confirmPassword) {
        return { error: "Passwords do not match." };
    }

    try {
        const existing = await withDbRetry((db) =>
            db.user.findUnique({
                where: { email: email.toLowerCase() },
            })
        );

        if (existing) {
            return { error: "An account with this email already exists." };
        }

        const passwordHash = await hashPassword(password);
        const user = await withDbRetry((db) =>
            db.user.create({
                data: {
                    email: email.toLowerCase(),
                    passwordHash,
                },
            })
        );

        await setSessionCookie(user.id, user.email);
    } catch (err: any) {
        console.error("Signup error:", err);
        const msg = err?.message || "";
        if (msg.includes("DATABASE_URL") || msg.includes("PrismaClient") || msg.includes("connect") || msg.includes("reach")) {
            return { error: "Database connection failed or timed out. Please wait a moment for the database to wake up and try again." };
        }
        return { error: err?.message || "Failed to create account. Please try again." };
    }

    redirect("/playing");
}

export async function logoutAction() {
    await clearSessionCookie();
    redirect("/login");
}

export async function changePasswordAction(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
    const session = await getSession();
    if (!session?.userId) {
        return { error: "Unauthorized" };
    }

    const currentPassword = formData.get("currentPassword")?.toString();
    const newPassword = formData.get("newPassword")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "Please fill in all password fields." };
    }

    if (newPassword.length < 6) {
        return { error: "New password must be at least 6 characters long." };
    }

    if (newPassword !== confirmPassword) {
        return { error: "New passwords do not match." };
    }

    try {
        const user = await withDbRetry((db) =>
            db.user.findUnique({
                where: { id: session.userId },
            })
        );

        if (!user) {
            return { error: "User account not found." };
        }

        const isValid = await verifyPassword(currentPassword, user.passwordHash);
        if (!isValid) {
            return { error: "Incorrect current password." };
        }

        const newHash = await hashPassword(newPassword);
        await withDbRetry((db) =>
            db.user.update({
                where: { id: session.userId },
                data: { passwordHash: newHash },
            })
        );

        return { success: true };
    } catch (err) {
        console.error("Change password error:", err);
        return { error: "Failed to change password. Please try again." };
    }
}
