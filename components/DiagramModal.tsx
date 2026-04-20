"use client";

import * as React from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
};

export function DiagramModal({ open, onOpenChange, title, children }: Props) {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    if (!open) setScale(1);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="print:hidden max-h-[90vh] max-w-4xl overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-end gap-2 border-b pb-2">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="Zoom out"
            onClick={() => setScale((s) => Math.max(0.6, Math.round((s - 0.1) * 10) / 10))}
          >
            <ZoomOut />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="Zoom in"
            onClick={() => setScale((s) => Math.min(2, Math.round((s + 0.1) * 10) / 10))}
          >
            <ZoomIn />
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-auto rounded-md border bg-card p-3">
          <div
            style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
            className="mx-auto w-full transition-transform"
          >
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
