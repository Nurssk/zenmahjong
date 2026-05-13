import Link from "next/link";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TournamentCard() {
  return (
    <Card>
      <CardHeader>
        <Trophy className="text-primary" />
        <CardTitle>Ежедневный турнир</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-black">#12</p>
            <p className="text-xs text-muted-foreground">Мир</p>
          </div>
          <div>
            <p className="text-2xl font-black">#2</p>
            <p className="text-xs text-muted-foreground">Казахстан</p>
          </div>
          <div>
            <p className="text-2xl font-black">#1</p>
            <p className="text-xs text-muted-foreground">Павлодар</p>
          </div>
        </div>
        <Button asChild className="mt-5 w-full">
          <Link href="/leaderboard">Открыть рейтинг</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
