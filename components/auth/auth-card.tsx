import { BrandMark } from "@/components/layout/brand-mark";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="zen-card-glow mx-auto w-full max-w-md border-primary/25 bg-card/95 shadow-premium backdrop-blur-xl">
      <CardHeader className="items-center gap-3 pb-4 text-center">
        <BrandMark className="mb-4" />
        <CardTitle className="type-heading-lg max-w-xs text-zen-gradient">
          {title}
        </CardTitle>
        {subtitle ? (
          <p className="type-body max-w-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
