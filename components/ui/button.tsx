import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-body text-sm font-bold tracking-normal transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-gold bg-zen-cta text-primary-foreground shadow-[0_0_30px_rgba(255,136,0,0.3)] hover:shadow-ember",
        secondary:
          "border border-primary/30 bg-secondary text-secondary-foreground hover:border-primary/60 hover:bg-muted",
        outline:
          "border border-primary/30 bg-popover text-foreground hover:border-primary/60 hover:bg-secondary",
        ghost: "text-muted-foreground hover:bg-secondary hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        premium:
          "border border-purple-energy/50 bg-gradient-to-r from-purple-energy to-[#7c2bd6] text-white shadow-premium hover:shadow-[0_0_36px_rgba(170,68,255,0.5)]",
      },
      size: {
        default: "h-11 px-5 py-3",
        sm: "h-9 px-3",
        lg: "h-14 px-8 text-base",
        xl: "h-20 px-8 font-display text-xl font-black uppercase tracking-[0.035em] shadow-[0_0_34px_rgba(255,136,0,0.28)] sm:px-12 sm:text-2xl md:text-3xl",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
