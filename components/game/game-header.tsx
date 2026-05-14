import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CurrencyPill } from "@/components/layout/currency-pill";
import { demoProfile } from "@/constants/product";
import { Button } from "@/components/ui/button";

export function GameHeader() {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-primary/20 bg-background-mid/80 px-2 py-2 backdrop-blur-xl md:px-4 md:py-3">
      <Button asChild variant="ghost" size="sm">
        <Link href="/dashboard">
          <ArrowLeft data-icon="inline-start" />
          Выйти
        </Link>
      </Button>
      <div className="flex items-center gap-2 md:justify-end">
        <CurrencyPill type="coins" value={demoProfile.coins} className="hidden sm:inline-flex" />
        <CurrencyPill type="gems" value={demoProfile.gems} className="hidden sm:inline-flex" />
      </div>
    </div>
  );
}
