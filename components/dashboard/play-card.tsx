import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gameModes } from "@/constants/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlayCard() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Игра</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {gameModes.map((mode) => (
          <div key={mode.id} className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{mode.name}</h3>
                <p className="mt-1 text-xs text-primary">{mode.duration}</p>
              </div>
              <Button asChild size="icon" variant="ghost">
                <Link href="/game" aria-label={`Играть: ${mode.name}`}>
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {mode.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
