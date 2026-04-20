"use client";

import * as React from "react";
import Link from "next/link";

import { measurementGuides } from "@/data/measurementGuides";
import { AppDisclaimer } from "@/components/AppDisclaimer";
import { GuideCard } from "@/components/GuideCard";
import { DiagramModal } from "@/components/DiagramModal";
import { DiagramForGuide } from "@/components/DiagramForGuide";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MeasurementGuide } from "@/types/models";

export default function GuidesPage() {
  const [q, setQ] = React.useState("");
  const [highlight, setHighlight] = React.useState<MeasurementGuide | null>(null);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return measurementGuides;
    return measurementGuides.filter(
      (g) =>
        g.title.toLowerCase().includes(s) ||
        g.requiredView.toLowerCase().includes(s) ||
        g.shortLabel.toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="border-b bg-card px-4 py-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Measurement guide</h1>
            <p className="text-sm text-muted-foreground">
              Searchable reference for each standard measurement.
            </p>
          </div>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "inline-flex min-h-11 items-center justify-center no-underline"
            )}
          >
            Back to app
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-6">
        <Input
          className="min-h-11 text-base"
          placeholder="Search by name, view, or label…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="space-y-4">
          {filtered.map((g) => (
            <GuideCard
              key={g.key}
              guide={g}
              onShowOnDiagram={() => setHighlight(g)}
            />
          ))}
        </div>
      </main>

      <AppDisclaimer />

      <DiagramModal
        open={highlight !== null}
        onOpenChange={(o) => {
          if (!o) setHighlight(null);
        }}
        title={highlight?.title ?? ""}
      >
        {highlight ? (
          <DiagramForGuide
            view={highlight.diagramView}
            highlight={highlight.diagramHighlight ?? null}
          />
        ) : null}
      </DiagramModal>
    </div>
  );
}
