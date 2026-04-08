import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export default function AuthCard({
  title,
  description,
  children,
  className,
}: AuthCardProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header — mobile: floating icon above card; desktop: minimal inline */}
      <div className="space-y-1.5 text-center lg:text-left">
        {/* Icon — only visible on mobile */}
        <div className="lg:hidden relative mx-auto w-fit">
          <div className="absolute -inset-3 rounded-full bg-primary/15 blur-xl" />
          <div className="relative flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-background shadow-sm">
            <svg
              className="size-7 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {children}
    </div>
  );
}
