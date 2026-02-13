import React from "react";

type BadgeVariant = "tour" | "place";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ variant = "tour", className = "", ...props }: BadgeProps) {
  const classes = `badge badge-${variant} ${className}`.trim();
  return <span className={classes} {...props} />;
}
