"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Row = { label: string; value: string; flag?: boolean };

type Props = {
  title?: string;
  rows: Row[];
  warnings?: string[];
  className?: string;
};

export function CalculationCard({
  title = "Calculations",
  rows,
  warnings,
  className,
}: Props) {
  return (
    <Card className={cn("border-border/80", className)}>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <dl className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <dt className="text-muted-foreground">{r.label}</dt>
              <dd className="flex items-center gap-2 font-medium tabular-nums">
                {r.flag ? (
                  <Badge variant="destructive" className="text-xs">
                    Check
                  </Badge>
                ) : null}
                <span>{r.value}</span>
              </dd>
            </div>
          ))}
        </dl>
        {warnings && warnings.length > 0 ? (
          <ul className="space-y-1 rounded-md border border-amber-300/60 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-50">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
