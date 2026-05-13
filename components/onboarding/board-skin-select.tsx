import { boardSkins } from "@/constants/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BoardSkinSelect() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {boardSkins.map((skin) => (
        <Card key={skin.id} className={skin.id === "shadow" ? "border-primary/50" : undefined}>
          <CardHeader>
            <div className="h-24 rounded-lg border border-border bg-gradient-to-br from-background via-card to-primary/25" />
            <CardTitle>{skin.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">{skin.description}</p>
            <p className="mt-3 text-xs font-semibold text-primary">{skin.palette}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
