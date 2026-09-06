"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { signupAction, AuthState } from "@/app/actions/auth";
import { Gamepad2 } from "lucide-react";

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState<AuthState, FormData>(
        signupAction,
        {}
    );

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
                        Create your personal video game library
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-6 shadow-xl">
                    <h2 className="font-heading font-semibold text-lg text-[#edebe6] uppercase mb-4 pb-2 border-b border-[#262624]">
                        Create Account
                    </h2>

                    <form action={formAction} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono-num text-[#9c9a92] uppercase mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
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
                                minLength={6}
                                autoComplete="new-password"
                                placeholder="At least 6 characters"
                                className="w-full bg-[#111110] border border-[#383834] rounded-[2px] px-3 py-2 text-sm text-[#edebe6] placeholder-[#696861] focus:outline-none focus:border-[#9c9a92] font-mono-num"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono-num text-[#9c9a92] uppercase mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                minLength={6}
                                autoComplete="new-password"
                                placeholder="Repeat password"
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
                            className="w-full py-2.5 text-sm font-mono-num font-semibold bg-[#2e2e2a] hover:bg-[#3d3d37] text-[#edebe6] border border-[#4a4a44] rounded-[2px] transition-colors uppercase tracking-wide disabled:opacity-50 mt-2"
                        >
                            {isPending ? "Creating account..." : "Sign Up"}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-[#262624] text-center">
                        <p className="text-xs font-mono-num text-[#9c9a92]">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-[#edebe6] underline underline-offset-4 hover:text-white"
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
