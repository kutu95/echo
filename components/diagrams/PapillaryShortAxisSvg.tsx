"use client";

import { cn } from "@/lib/utils";

type Props = {
  highlight?: string | null;
  className?: string;
};

function ring(name: string, active?: string | null) {
  return active === name
    ? "stroke-[#1d4ed8] stroke-[3]"
    : "stroke-foreground/35 stroke-[1.5]";
}

/** Educational schematic — papillary muscle short-axis. */
export function PapillaryShortAxisSvg({ highlight, className }: Props) {
  return (
    <svg
      viewBox="0 0 440 340"
      className={cn("w-full max-w-xl text-foreground", className)}
      role="img"
      aria-label="Schematic papillary muscle short-axis for M-mode"
    >
      <rect
        x="8"
        y="8"
        width="424"
        height="324"
        rx="12"
        className="fill-background stroke-border"
        strokeWidth={1.5}
      />
      <text x="24" y="36" className="fill-foreground text-[14px] font-medium">
        Papillary muscle short-axis (schematic)
      </text>

      {/* LV cavity */}
      <circle
        cx="220"
        cy="190"
        r="95"
        className="fill-muted/20 stroke-foreground/30"
        strokeWidth={1.5}
      />

      {/* IVS */}
      <path
        d="M 125 120 C 140 150 140 230 125 260 L 155 255 C 165 220 165 170 155 135 Z"
        className={cn(
          highlight === "IVSd" || highlight === "IVSs"
            ? "fill-[#dbeafe] stroke-[#1d4ed8] stroke-[3]"
            : "fill-muted/50 stroke-foreground/40 stroke-[1.5]"
        )}
      />
      <text x="135" y="200" className="fill-foreground text-[12px] font-medium">
        IVS
      </text>

      {/* LVPW */}
      <path
        d="M 315 135 C 300 170 300 220 315 255 L 285 250 C 275 215 275 175 285 140 Z"
        className={cn(
          highlight === "LVPWd" || highlight === "LVPWs"
            ? "fill-[#dbeafe] stroke-[#1d4ed8] stroke-[3]"
            : "fill-muted/50 stroke-foreground/40 stroke-[1.5]"
        )}
      />
      <text x="285" y="200" className="fill-foreground text-[12px] font-medium">
        LVPW
      </text>

      {/* Papillary muscles */}
      <ellipse
        cx="175"
        cy="175"
        rx="22"
        ry="34"
        className={cn(ring("PM", highlight), "fill-muted/60")}
      />
      <ellipse
        cx="265"
        cy="205"
        rx="22"
        ry="34"
        className={cn(ring("PM", highlight), "fill-muted/60")}
      />
      <text x="160" y="178" className="fill-foreground text-[11px]">
        PM
      </text>
      <text x="250" y="208" className="fill-foreground text-[11px]">
        PM
      </text>

      {/* LVID line */}
      <line
        x1="155"
        y1="190"
        x2="285"
        y2="190"
        className={cn(
          highlight === "LVIDd" || highlight === "LVIDs"
            ? "stroke-[#1d4ed8]"
            : "stroke-primary/60"
        )}
        strokeWidth={highlight === "LVIDd" || highlight === "LVIDs" ? 3 : 2}
        strokeDasharray="6 4"
      />
      <text x="210" y="182" className="fill-foreground text-[11px]">
        LVIDd / LVIDs (inner-edge)
      </text>

      {/* M-mode cursor */}
      <line
        x1="220"
        y1="40"
        x2="220"
        y2="300"
        className="stroke-amber-600/70"
        strokeWidth={2}
        strokeDasharray="4 4"
      />
      <text
        x="228"
        y="60"
        className="fill-amber-700 text-[11px] font-medium"
      >
        M-mode cursor
      </text>

      <text x="24" y="312" className="fill-muted-foreground text-[11px]">
        Largest cavity = diastole · smallest = systole · standard landmarks
      </text>
    </svg>
  );
}
