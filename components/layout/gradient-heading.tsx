import { cn } from "@/lib/utils";

export function GradientHeading({
  children,
  className,
  as = "h1",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const Comp = as;

  return (
    <Comp className={cn("type-heading-xl bg-zen-title bg-clip-text text-transparent", className)}>
      {children}
    </Comp>
  );
}
