"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-zen-page px-4">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-card/80 p-8 text-center shadow-glass backdrop-blur-xl">
          <Loader2 className="size-8 animate-spin text-primary" />
          <div>
            <p className="font-display text-xl font-black uppercase tracking-[0.05em] text-zen-gradient">
              Проверяем доступ
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Подготавливаем твой профиль Zen Mahjong.</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
