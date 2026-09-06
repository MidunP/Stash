"use client";

import React, { useState, useRef } from "react";
import { changePasswordAction } from "@/app/actions/auth";
import { exportUserLibraryAction, importUserLibraryAction } from "@/app/actions/games";
import { useToast } from "@/components/ui/Toast";
import { Shield, KeyRound, Download, Upload, Loader2, Check, AlertCircle } from "lucide-react";

export function ProfileSettingsForm({ userEmail }: { userEmail: string }) {
    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwdLoading, setPwdLoading] = useState(false);

    // Export/Import state
    const [exportLoading, setExportLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { showToast } = useToast();

    // Password Change Handler
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            showToast("New password must be at least 6 characters.", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast("New passwords do not match.", "error");
            return;
        }

        setPwdLoading(true);
        const formData = new FormData();
        formData.append("currentPassword", currentPassword);
        formData.append("newPassword", newPassword);
        formData.append("confirmPassword", confirmPassword);

        const res = await changePasswordAction(null, formData);
        setPwdLoading(false);

        if (res.error) {
            showToast(res.error, "error");
        } else {
            showToast("Password updated successfully!", "success");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
    };

    // Data Export Handler
    const handleExport = async () => {
        setExportLoading(true);
        try {
            const res = await exportUserLibraryAction();
            if (res.success && res.data) {
                const jsonStr = JSON.stringify(res.data, null, 2);
                const blob = new Blob([jsonStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);

                const dateStr = new Date().toISOString().split("T")[0];
                const a = document.createElement("a");
                a.href = url;
                a.download = `game-tracker-backup-${dateStr}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                showToast(`Exported ${res.data.length} games to JSON!`, "success");
            }
        } catch (err) {
            console.error("Export error:", err);
            showToast("Failed to export library data.", "error");
        } finally {
            setExportLoading(false);
        }
    };

    // Data Import Handler
    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportLoading(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const content = evt.target?.result as string;
                const parsed = JSON.parse(content);

                if (!Array.isArray(parsed)) {
                    showToast("Invalid JSON file. Expected array of game objects.", "error");
                    setImportLoading(false);
                    return;
                }

                const res = await importUserLibraryAction(parsed);
                if (res.error) {
                    showToast(res.error, "error");
                } else {
                    showToast(
                        `Import complete: ${res.importedCount} added, ${res.skippedCount} skipped (duplicates/errors).`,
                        "success"
                    );
                }
            } catch (err) {
                console.error("Import JSON parse error:", err);
                showToast("Could not parse JSON file. Check format.", "error");
            } finally {
                setImportLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Change Password Section */}
            <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#262624]">
                    <KeyRound className="w-4 h-4 text-[#9c9a92]" />
                    <h3 className="font-heading font-semibold text-lg text-[#edebe6] uppercase">
                        Change Password
                    </h3>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-3 font-mono-num text-xs">
                    <div>
                        <label className="block text-[#696861] uppercase mb-1">Current Password</label>
                        <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-[#111110] border border-[#383834] focus:border-[#9c9a92] rounded-[2px] p-2.5 text-[#edebe6] focus:outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-[#696861] uppercase mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-[#111110] border border-[#383834] focus:border-[#9c9a92] rounded-[2px] p-2.5 text-[#edebe6] focus:outline-none"
                            placeholder="At least 6 characters"
                        />
                    </div>

                    <div>
                        <label className="block text-[#696861] uppercase mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#111110] border border-[#383834] focus:border-[#9c9a92] rounded-[2px] p-2.5 text-[#edebe6] focus:outline-none"
                            placeholder="Repeat new password"
                        />
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={pwdLoading}
                            className="px-4 py-2 bg-[#2e2e2a] hover:bg-[#3d3d37] text-[#edebe6] border border-[#4a4a44] rounded-[2px] font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {pwdLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5 text-[#9c9a92]" />}
                            <span>Update Password</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Data Management & Backup Section */}
            <div className="bg-[#171716] border border-[#262624] rounded-[3px] p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#262624]">
                    <Download className="w-4 h-4 text-[#9c9a92]" />
                    <h3 className="font-heading font-semibold text-lg text-[#edebe6] uppercase">
                        Data Backup & Import
                    </h3>
                </div>

                <p className="text-xs text-[#9c9a92] font-sans leading-relaxed">
                    Export your complete video game tracking library, including custom status history, ratings, notes, and playtime session logs into a portable JSON file.
                </p>

                <div className="space-y-3 pt-2 font-mono-num text-xs">
                    {/* Export */}
                    <div className="p-3 bg-[#141413] border border-[#222220] rounded-[2px] flex items-center justify-between gap-3">
                        <div>
                            <span className="text-[#edebe6] font-semibold block">Export Library JSON</span>
                            <span className="text-[#696861] text-[11px]">Download instant local JSON backup</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={exportLoading}
                            className="px-3 py-1.5 bg-[#222220] hover:bg-[#2e2e2a] border border-[#333330] text-[#edebe6] rounded-[2px] transition-colors flex items-center gap-1.5 shrink-0"
                        >
                            {exportLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-[#9c9a92]" />}
                            <span>Export JSON</span>
                        </button>
                    </div>

                    {/* Import */}
                    <div className="p-3 bg-[#141413] border border-[#222220] rounded-[2px] flex items-center justify-between gap-3">
                        <div>
                            <span className="text-[#edebe6] font-semibold block">Restore / Import Library</span>
                            <span className="text-[#696861] text-[11px]">Upload previous JSON backup file</span>
                        </div>
                        <div>
                            <input
                                type="file"
                                accept=".json"
                                ref={fileInputRef}
                                onChange={handleImportFile}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={importLoading}
                                className="px-3 py-1.5 bg-[#222220] hover:bg-[#2e2e2a] border border-[#333330] text-[#edebe6] rounded-[2px] transition-colors flex items-center gap-1.5 shrink-0"
                            >
                                {importLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-[#9c9a92]" />}
                                <span>Upload JSON</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
