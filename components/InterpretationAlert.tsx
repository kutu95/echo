"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { InterpretationBundle, InterpretationFinding } from "@/types/models";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function severityStyles(f: InterpretationFinding) {
  if (f.severity === "highlight")
    return "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-50";
  if (f.severity === "caution")
    return "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-50";
  return "border-border bg-muted/40";
}

type Props = {
  bundle: InterpretationBundle;
  overrides?: Record<string, string>;
  onOverrideChange?: (finding: InterpretationFinding, nextText: string) => void;
  onResetOverride?: (finding: InterpretationFinding) => void;
  className?: string;
};

export function InterpretationAlert({
  bundle,
  overrides,
  onOverrideChange,
  onResetOverride,
  className,
}: Props) {
  const effectiveText = (finding: InterpretationFinding) => {
    const override = overrides?.[finding.id];
    if (override === undefined || override.trim() === "") return finding.detail;
    return override;
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Alert className="border-primary/30 bg-primary/5">
        <AlertTitle>Decision support (not a diagnosis)</AlertTitle>
        <AlertDescription className="space-y-2 text-xs leading-relaxed">
          {bundle.safetyCopy.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        {bundle.findings.map((f) => (
          <Alert key={f.id} className={cn("text-sm", severityStyles(f))}>
            <AlertTitle className="text-sm font-semibold">{f.title}</AlertTitle>
            {onOverrideChange ? (
              <div className="mt-2 space-y-2">
                <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
                  Edit this report text (saved with the case).
                </AlertDescription>
                <Textarea
                  className="min-h-20 border-input bg-background text-foreground placeholder:text-muted-foreground text-xs"
                  value={effectiveText(f)}
                  onChange={(e) => onOverrideChange(f, e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-input bg-background text-foreground hover:bg-muted"
                    onClick={() => onResetOverride?.(f)}
                  >
                    Reset to calculated text
                  </Button>
                </div>
              </div>
            ) : (
              <AlertDescription className="text-xs leading-relaxed">
                {f.detail}
              </AlertDescription>
            )}
          </Alert>
        ))}
      </div>
    </div>
  );
}
