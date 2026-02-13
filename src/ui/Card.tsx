import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  clickable?: boolean;
};

export function Card({ clickable = false, className = "", ...props }: CardProps) {
  const classes = `card ${clickable ? "card-link" : ""} ${className}`.trim();
  return <div className={classes} {...props} />;
}
