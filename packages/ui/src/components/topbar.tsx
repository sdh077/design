import * as React from "react";

export function Topbar({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={`flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 ${className}`}
      {...props}
    />
  );
}