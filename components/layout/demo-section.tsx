import { cn } from "@/lib/utils";

export function DemoSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mx-auto w-full max-w-7xl px-4 py-16 md:px-6 md:py-24", className)}>
      {children}
    </section>
  );
}
