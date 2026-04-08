import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    <Card
      className={cn(
        "w-full border-border/30 shadow-2xl backdrop-blur-sm",
        className,
      )}
    >
      <CardHeader className="relative space-y-4 pb-8 pt-12">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-xl" />
            <div className="relative flex size-16 items-center justify-center rounded-2xl border border-border/50 bg-background/95 shadow-lg backdrop-blur-sm">
              <svg
                className="size-8 text-primary"
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
        </div>
        <CardTitle className="pt-6 text-center font-semibold text-2xl tracking-tight">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-balance text-center text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-10">{children}</CardContent>
    </Card>
  );
}
