import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex max-w-3xl flex-col gap-3">
      {eyebrow ? (
        <Badge variant="outline" className="type-caption w-fit border-primary/40 text-primary">
          {eyebrow}
        </Badge>
      ) : null}
      <h1 className="type-heading-xl bg-zen-title bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="type-body-lg text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
