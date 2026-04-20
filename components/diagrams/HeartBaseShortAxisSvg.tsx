"use client";

import { cn } from "@/lib/utils";

type Props = {
  highlight?: string | null;
  className?: string;
};

function hl(name: string, active?: string | null) {
  return active === name
    ? "stroke-[#1d4ed8] stroke-[3] fill-[#dbeafe]"
    : "stroke-foreground/40 stroke-[1.5] fill-muted/40";
}

/** Educational schematic — not anatomically to scale. */
export function HeartBaseShortAxisSvg({ highlight, className }: Props) {
  return (
    <svg
      viewBox="0 0 420 320"
      className={cn("w-full max-w-xl text-foreground", className)}
      role="img"
      aria-label="Schematic right parasternal short-axis at heart base"
    >
      <rect
        x="8"
        y="8"
        width="404"
        height="304"
        rx="12"
        className="fill-background stroke-border"
        strokeWidth={1.5}
      />
      <text x="24" y="36" className="fill-foreground text-[14px] font-medium">
        Heart base short-axis (schematic)
      </text>

      {/* RV */}
      <path
        d="M 120 220 C 90 200 90 120 130 100 L 200 110 C 170 150 150 210 120 220 Z"
        className={cn(hl("RV", highlight), "transition-colors")}
      />
      <text x="125" y="170" className="fill-foreground text-[12px] font-medium">
        RV
      </text>

      {/* Ao circle */}
      <circle
        cx="230"
        cy="150"
        r="42"
        className={cn(hl("Ao", highlight), "transition-colors")}
      />
      <text
        x="230"
        y="155"
        textAnchor="middle"
        className="fill-foreground text-[12px] font-medium"
      >
        Ao
      </text>

      {/* LA */}
      <path
        d="M 280 110 C 340 110 370 150 360 200 C 350 240 300 260 260 240 C 240 220 250 180 270 160 C 275 140 280 120 280 110 Z"
        className={cn(hl("LA", highlight), "transition-colors")}
      />
      <text x="310" y="200" className="fill-foreground text-[12px] font-medium">
        LA
      </text>

      {/* Calipers hint */}
      <line
        x1="188"
        y1="150"
        x2="272"
        y2="150"
        className="stroke-primary/70"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      <polygon
        points="188,150 198,145 198,155"
        className="fill-primary/70"
      />
      <polygon
        points="272,150 262,145 262,155"
        className="fill-primary/70"
      />
      <text
        x="230"
        y="138"
        textAnchor="middle"
        className="fill-muted-foreground text-[11px]"
      >
        LA width (same frame as Ao)
      </text>

      <text x="24" y="292" className="fill-muted-foreground text-[11px]">
        Early diastole · inner-edge to inner-edge for Ao · widest LA in-plane
      </text>
    </svg>
  );
}
