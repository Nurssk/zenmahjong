import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CurrencyPill } from "@/components/layout/currency-pill";
import { demoProfile } from "@/constants/product";
import { Button } from "@/components/ui/button";

export function GameHeader() {
  return (
    <div className="flex flex-col gap-3 border-b border-primary/20 bg-background-mid/80 p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
      <Button asChild variant="ghost">
        <Link href="/dashboard">
          <ArrowLeft data-icon="inline-start" />
          Выйти
        </Link>
      </Button>
      <div className="flex flex-wrap items-center gap-3 md:justify-end">
        <CurrencyPill type="coins" value={demoProfile.coins} className="hidden sm:inline-flex" />
        <CurrencyPill type="gems" value={demoProfile.gems} className="hidden sm:inline-flex" />
      </div>
    </div>
  );
}
