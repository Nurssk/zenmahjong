"use client";

import { Loader2 } from "lucide-react";

export function ProfileCheckScreen({ message = "Проверяем профиль..." }: { message?: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-zen-page px-4">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-card/80 p-8 text-center shadow-glass backdrop-blur-xl">
        <Loader2 className="size-8 animate-spin text-primary" />
        <div>
          <p className="font-display text-xl font-black uppercase tracking-[0.05em] text-zen-gradient">{message}</p>
          <p className="mt-2 text-sm text-muted-foreground">Подготавливаем твой путь в Zen Mahjong.</p>
        </div>
      </div>
    </main>
  );
}

