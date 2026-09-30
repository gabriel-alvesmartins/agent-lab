import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

const badgeVariants = cva(
  "inline-flex items-center rounded border font-medium transition-colors focus:outline-none select-none tracking-tight",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80",
        outline: "text-zinc-300 border-zinc-700/80 bg-zinc-900/40",
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        warning:
          "border-amber-500/20 bg-amber-500/10 text-amber-400",
        cyan:
          "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
        purple:
          "border-purple-500/20 bg-purple-500/10 text-purple-400",
      },
      size: {
        xs: "text-[8.5px] px-1 py-0 leading-tight",
        sm: "text-[9px] px-1 py-0 leading-tight",
        default: "text-[9.5px] px-1.5 py-0 leading-tight",
        lg: "text-[10.5px] px-2 py-0.5 leading-snug",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const sizeStyleMap: Record<string, React.CSSProperties> = {
  xs: { fontSize: 8.5, lineHeight: "12px", padding: "0px 4px" },
  sm: { fontSize: 9, lineHeight: "13px", padding: "0.5px 5px" },
  default: { fontSize: 9.5, lineHeight: "13.5px", padding: "1px 5px" },
  lg: { fontSize: 10.5, lineHeight: "15px", padding: "1.5px 7px" },
};

function Badge({ className, variant, size = "default", style, ...props }: BadgeProps) {
  const chosenSize = size || "default";
  const sizeFallback = sizeStyleMap[chosenSize] || sizeStyleMap.default;

  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      style={{
        ...sizeFallback,
        borderRadius: "var(--radius-xs, 3px)",
        fontWeight: 500,
        letterSpacing: "0.02em",
        ...style,
      }}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
