import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Navbar } from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/ui/Toast";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <ToastProvider>
            <div className="min-h-screen flex flex-col bg-[#111110]">
                <Navbar userEmail={user.email} />
                <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
                    {children}
                </main>
                <footer className="border-t border-[#222220] py-6 text-center text-xs font-mono-num text-[#696861]">
                    <span>GAME TRACKER — Personal Gaming Library</span>
                </footer>
            </div>
        </ToastProvider>
    );
}

