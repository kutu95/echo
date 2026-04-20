"use client";

import { cn } from "@/lib/utils";

type Props = {
  highlight?: string | null;
  className?: string;
};

export function OptionalSchematicSvg({ highlight, className }: Props) {
  const mv =
    highlight === "MV"
      ? "stroke-[#1d4ed8] stroke-[3] fill-[#dbeafe]"
      : "stroke-foreground/40 stroke-[1.5] fill-muted/30";
  const lv =
    highlight === "LV"
      ? "stroke-[#1d4ed8] stroke-[3] fill-[#dbeafe]/60"
      : "stroke-foreground/30 stroke-[1.5] fill-muted/20";
  const ao =
    highlight === "Ao"
      ? "stroke-[#1d4ed8] stroke-[3] fill-[#dbeafe]"
      : "stroke-foreground/40 stroke-[1.5] fill-muted/30";

  return (
    <svg
      viewBox="0 0 420 300"
      className={cn("w-full max-w-lg text-foreground", className)}
      role="img"
      aria-label="Generic long-axis schematic for optional measurements"
    >
      <rect
        x="8"
        y="8"
        width="404"
        height="284"
        rx="12"
        className="fill-background stroke-border"
        strokeWidth={1.5}
      />
      <text x="24" y="34" className="fill-foreground text-[14px] font-medium">
        Long-axis schematic (optional indices)
      </text>

      <path
        d="M 80 220 C 120 120 260 90 340 140 L 330 200 C 260 170 140 200 80 220 Z"
        className={lv}
      />
      <text x="200" y="170" className="fill-foreground text-[12px] font-medium">
        LV
      </text>

      <path
        d="M 120 150 C 150 120 210 120 240 150 L 230 175 C 200 160 160 160 130 175 Z"
        className={mv}
      />
      <text x="175" y="155" className="fill-foreground text-[11px] font-medium">
        MV
      </text>

      <circle cx="300" cy="120" r="26" className={ao} />
      <text x="300" y="125" textAnchor="middle" className="text-[11px] font-medium">
        Ao
      </text>

      <text x="24" y="276" className="fill-muted-foreground text-[11px]">
        Illustrative only — align Doppler and linear measures to your lab SOP.
      </text>
    </svg>
  );
}
