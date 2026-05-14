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
      <CardHeader className="items-center gap-2 p-4 pb-3 text-center sm:gap-3 sm:p-6 sm:pb-4">
        <BrandMark className="mb-2 sm:mb-4" />
        <CardTitle className="max-w-xs font-display text-2xl font-black uppercase tracking-[0.02em] text-zen-gradient sm:type-heading-lg">
          {title}
        </CardTitle>
        {subtitle ? (
          <p className="max-w-sm text-sm leading-6 text-muted-foreground sm:type-body">{subtitle}</p>
        ) : null}
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">{children}</CardContent>
    </Card>
  );
}
