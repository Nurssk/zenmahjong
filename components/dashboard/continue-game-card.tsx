import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ContinueGameCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Продолжить</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Сид ежедневного турнира</p>
        <p className="mt-2 text-3xl font-black">68%</p>
        <Progress value={68} className="mt-4" />
        <Button asChild className="mt-5 w-full">
          <Link href="/game">В бой</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
