"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
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
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return { error: "Invalid email or password." };
        }

        const passwordValid = await verifyPassword(password, user.passwordHash);
        if (!passwordValid) {
            return { error: "Invalid email or password." };
        }

        await setSessionCookie(user.id, user.email);
    } catch (err) {
        console.error("Login error:", err);
        return { error: "An unexpected error occurred. Please try again." };
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
        const existing = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existing) {
            return { error: "An account with this email already exists." };
        }

        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
            },
        });

        await setSessionCookie(user.id, user.email);
    } catch (err) {
        console.error("Signup error:", err);
        return { error: "Failed to create account. Please try again." };
    }

    redirect("/playing");
}

export async function logoutAction() {
    await clearSessionCookie();
    redirect("/login");
}
