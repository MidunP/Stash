import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { User, Shield, Download, Upload, Clock, Gamepad2, Calendar } from "lucide-react";
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";

export const metadata = {
    title: "Account & Profile Settings — Game Tracker",
};

export default async function ProfilePage() {
    const user = await getCurrentUser();

    if (!user) return null;

    // Fetch user aggregate stats
    const userGames = await prisma.userGame.findMany({
        where: { userId: user.id },
    });

    const totalGames = userGames.length;
    const totalHours = userGames.reduce((acc, g) => acc + g.hoursLogged, 0);
    const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-[#262624]">
                <h1 className="font-heading font-bold text-3xl text-[#edebe6] uppercase tracking-wider">
                    Account & Settings
                </h1>
                <p className="text-xs font-mono-num text-[#9c9a92] mt-1">
                    Manage your account security, personal details, and database backups
                </p>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#222220] border border-[#383834] flex items-center justify-center text-[#edebe6]">
                        <User className="w-7 h-7 text-[#9c9a92]" />
                    </div>
                    <div>
                        <h2 className="font-heading font-semibold text-2xl text-[#edebe6]">
                            {user.email}
                        </h2>
                        <div className="flex items-center gap-4 text-xs font-mono-num text-[#9c9a92] mt-1 flex-wrap">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#696861]" />
                                Member since {memberSince}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-[#262624] pt-4 md:pt-0 md:pl-6 w-full md:w-auto font-mono-num">
                    <div>
                        <span className="text-[10px] text-[#696861] uppercase block">Total Library</span>
                        <span className="text-xl text-[#edebe6] font-bold">{totalGames} games</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-[#696861] uppercase block">Logged Playtime</span>
                        <span className="text-xl text-[#f59e0b] font-bold">{totalHours.toFixed(1)} hrs</span>
                    </div>
                </div>
            </div>

            {/* Interactive Settings Components */}
            <ProfileSettingsForm userEmail={user.email} />
        </div>
    );
}
