"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { Search, LogOut, Menu, X, Gamepad2, User } from "lucide-react";

interface NavbarProps {
    userEmail?: string;
}

export function Navbar({ userEmail }: NavbarProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { href: "/playing", label: "Playing" },
        { href: "/watchlist", label: "Watchlist" },
        { href: "/library", label: "Library" },
        { href: "/stats", label: "Stats" },
    ];

    const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

    return (
        <header className="bg-[#141413] border-b border-[#262624] sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Brand Logo & Main Nav */}
                <div className="flex items-center gap-8">
                    <Link
                        href="/playing"
                        className="flex items-center gap-2 font-heading font-bold text-xl tracking-wider text-[#edebe6] uppercase hover:text-white transition-colors"
                    >
                        <Gamepad2 className="w-5 h-5 text-[#9c9a92] stroke-[1.75]" />
                        <span>GAME TRACKER</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1 font-heading text-base tracking-wide uppercase">
                        {navLinks.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-3 py-1.5 rounded-[2px] transition-colors ${active
                                        ? "text-[#edebe6] bg-[#222220] font-semibold border-b-2 border-[#9c9a92]"
                                        : "text-[#9c9a92] hover:text-[#edebe6] hover:bg-[#1a1a18]"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Right Section: Search + User Menu */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/search"
                        className={`px-3 py-1.5 text-xs font-mono-num rounded-[2px] border transition-colors flex items-center gap-2 ${isActive("/search")
                            ? "bg-[#222220] border-[#4a4a44] text-[#edebe6]"
                            : "bg-[#171716] border-[#262624] text-[#9c9a92] hover:border-[#383834] hover:text-[#edebe6]"
                            }`}
                    >
                        <Search className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Search Games</span>
                    </Link>

                    {userEmail && (
                        <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-[#262624]">
                            <Link
                                href="/profile"
                                className={`text-xs font-mono-num px-2 py-1 rounded-[2px] flex items-center gap-1.5 transition-colors ${isActive("/profile")
                                    ? "bg-[#222220] text-[#edebe6] font-semibold"
                                    : "text-[#9c9a92] hover:text-[#edebe6] hover:bg-[#1a1a18]"
                                    }`}
                                title="Account Settings"
                            >
                                <User className="w-3.5 h-3.5 text-[#9c9a92]" />
                                <span className="truncate max-w-[120px]">{userEmail.split("@")[0]}</span>
                            </Link>
                            <form action={logoutAction}>
                                <button
                                    type="submit"
                                    className="text-xs font-mono-num text-[#696861] hover:text-[#f87171] transition-colors flex items-center gap-1"
                                    title="Log out"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span className="hidden lg:inline">Logout</span>
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-1.5 text-[#9c9a92] hover:text-[#edebe6]"
                        aria-label="Toggle navigation menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="md:hidden bg-[#171716] border-b border-[#262624] px-4 py-3 space-y-2 font-heading uppercase text-lg">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-3 py-2 rounded-[2px] ${isActive(link.href) ? "bg-[#222220] text-[#edebe6]" : "text-[#9c9a92]"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {userEmail && (
                        <>
                            <Link
                                href="/profile"
                                onClick={() => setMobileOpen(false)}
                                className={`block px-3 py-2 rounded-[2px] ${isActive("/profile") ? "bg-[#222220] text-[#edebe6]" : "text-[#9c9a92]"
                                    }`}
                            >
                                Profile & Settings
                            </Link>
                            <div className="pt-2 border-t border-[#262624] flex items-center justify-between text-xs font-mono-num text-[#9c9a92]">
                                <span>{userEmail}</span>
                                <form action={logoutAction}>
                                    <button type="submit" className="text-[#f87171] uppercase font-semibold">
                                        Log out
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}

