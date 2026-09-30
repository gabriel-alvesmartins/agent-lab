import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

const buttonVariants = cva(
  "ui-btn",
  {
    variants: {
      variant: {
        default:
          "ui-btn-default bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white",
        primary:
          "ui-btn-primary bg-indigo-600 text-white hover:bg-indigo-500 border-indigo-500",
        destructive:
          "ui-btn-destructive bg-rose-950 text-rose-200 border-rose-800/60 hover:bg-rose-900",
        outline:
          "ui-btn-outline border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white",
        secondary:
          "ui-btn-secondary text-zinc-200 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white",
        ghost:
          "ui-btn-ghost text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100",
        link:
          "ui-btn-ghost text-indigo-400 underline-offset-4 hover:underline",
        accent:
          "ui-btn-accent text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30",
      },
      size: {
        default: "ui-btn-size-default h-8 px-3 text-xs",
        sm: "ui-btn-size-sm h-7 px-2.5 text-xs",
        lg: "ui-btn-size-lg h-9 px-4 text-sm",
        icon: "ui-btn-size-icon h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
