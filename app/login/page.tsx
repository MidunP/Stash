"use client";

import React, { useState, useEffect, useActionState } from "react";
import Link from "next/link";
import { loginAction, AuthState } from "@/app/actions/auth";
import { Gamepad2, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState<AuthState, FormData>(
        loginAction,
        {}
    );
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        // Pre-warm database connection on page load for smooth sign in
        fetch("/api/warmup").catch(() => { });
    }, []);

    return (
        <div className="min-h-screen bg-[#111110] flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-[#171716] border border-[#262624] rounded-[2px] mb-3">
                        <Gamepad2 className="w-6 h-6 text-[#9c9a92]" />
                    </div>
                    <h1 className="font-heading font-bold text-3xl text-[#edebe6] tracking-wider uppercase">
                        GAME TRACKER
                    </h1>
                    <p className="text-xs font-mono-num text-[#696861] mt-1">
                        Personal video game log & library
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-6 shadow-xl">
                    <div className="flex items-center justify-between pb-2 mb-4 border-b border-[#262624]">
                        <h2 className="font-heading font-semibold text-lg text-[#edebe6] uppercase">
                            Sign In
                        </h2>
                    </div>

                    <form action={formAction} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono-num text-[#9c9a92] uppercase mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                placeholder="you@example.com"
                                className="w-full bg-[#111110] border border-[#383834] rounded-[2px] px-3 py-2 text-sm text-[#edebe6] placeholder-[#696861] focus:outline-none focus:border-[#9c9a92] font-mono-num"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono-num text-[#9c9a92] uppercase mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="w-full bg-[#111110] border border-[#383834] rounded-[2px] px-3 py-2 text-sm text-[#edebe6] placeholder-[#696861] focus:outline-none focus:border-[#9c9a92] font-mono-num"
                            />
                        </div>

                        {state?.error && (
                            <div className="p-2.5 text-xs font-mono-num text-[#f87171] bg-[#291617] border border-[#4d2325] rounded-[2px]">
                                {state.error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-2.5 text-sm font-mono-num font-semibold bg-[#2e2e2a] hover:bg-[#3d3d37] text-[#edebe6] border border-[#4a4a44] rounded-[2px] transition-colors uppercase tracking-wide disabled:opacity-50 mt-2 cursor-pointer flex items-center justify-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-[#9c9a92]" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-[#262624] text-center">
                        <p className="text-xs font-mono-num text-[#9c9a92]">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/signup"
                                className="text-[#edebe6] underline underline-offset-4 hover:text-white"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
