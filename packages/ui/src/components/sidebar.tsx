import * as React from "react";

export function Sidebar({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={`w-64 border-r border-zinc-800 bg-zinc-950 ${className}`}
      {...props}
    />
  );
}

export function SidebarHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`border-b border-zinc-800 px-5 py-4 ${className}`}
      {...props}
    />
  );
}

export function SidebarContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-3 ${className}`} {...props} />;
}

export function SidebarGroup({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-4 ${className}`} {...props} />;
}

export function SidebarGroupLabel({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`mb-2 px-2 text-xs font-medium uppercase tracking-wide text-zinc-500 ${className}`}
      {...props}
    />
  );
}