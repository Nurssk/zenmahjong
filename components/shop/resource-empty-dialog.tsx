"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ResourceEmptyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  shopHref?: string;
  shopLabel?: string;
};

export function ResourceEmptyDialog({
  description,
  onOpenChange,
  open,
  shopHref = "/shop",
  shopLabel = "Открыть магазин",
  title,
}: ResourceEmptyDialogProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[1400] grid place-items-center bg-black/70 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="resource-empty-title"
        >
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-primary/35 bg-[#101014]/94 p-5 text-center shadow-[0_30px_100px_rgba(0,0,0,0.72)] backdrop-blur-2xl sm:p-6"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
            <button
              type="button"
              aria-label="Закрыть"
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg border border-primary/15 bg-popover/70 text-muted-foreground transition hover:border-primary/45 hover:text-primary"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </button>
            <div className="mx-auto grid size-14 place-items-center rounded-full border border-primary/25 bg-primary/14 text-primary shadow-[0_0_32px_rgba(255,107,53,0.26)]">
              <ShoppingBag className="size-7" />
            </div>
            <h2 id="resource-empty-title" className="mt-5 font-display text-3xl font-black uppercase tracking-[0.06em] text-foreground">
              {title}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button asChild>
                <Link href={shopHref}>
                  <ShoppingBag className="size-4" />
                  {shopLabel}
                </Link>
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Позже
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
