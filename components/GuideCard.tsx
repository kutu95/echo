"use client";

import type { MeasurementGuide } from "@/types/models";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Props = {
  guide: MeasurementGuide;
  onShowOnDiagram?: () => void;
};

export function GuideCard({ guide, onShowOnDiagram }: Props) {
  return (
    <Card size="sm" className="border-border/80">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle>{guide.title}</CardTitle>
            <CardDescription>
              {guide.shortLabel} · {guide.unit}
            </CardDescription>
          </div>
          {onShowOnDiagram ? (
            <Button type="button" variant="outline" size="sm" onClick={onShowOnDiagram}>
              Show on diagram
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div>
          <p className="font-medium text-foreground">View</p>
          <p className="text-muted-foreground">{guide.requiredView}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">Timing</p>
          <p className="text-muted-foreground">{guide.cardiacTiming}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">Landmarks / calipers</p>
          <p className="text-muted-foreground">{guide.landmarks}</p>
        </div>
        <Separator />
        <div>
          <p className="font-medium text-foreground">Common pitfalls</p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {guide.pitfalls.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">Why it matters</p>
          <p className="text-muted-foreground">{guide.clinicalWhy}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">Interpretation significance</p>
          <p className="text-muted-foreground">{guide.significance}</p>
        </div>
      </CardContent>
    </Card>
  );
}
