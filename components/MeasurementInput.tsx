"use client";

import * as React from "react";
import type { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { BookOpen, HelpCircle, ImageIcon } from "lucide-react";

import type { MeasurementKey } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Props = {
  id: MeasurementKey;
  label: string;
  unit: string;
  hint: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  onOpenGuide: () => void;
  onOpenDiagram: () => void;
  onViewImage?: () => void;
  showImageButton?: boolean;
  className?: string;
};

export const MeasurementInput = React.forwardRef<HTMLInputElement, Props>(
  function MeasurementInput(
    {
      id,
      label,
      unit,
      hint,
      registration,
      error,
      onOpenGuide,
      onOpenDiagram,
      onViewImage,
      showImageButton,
      className,
    },
    ref
  ) {
    return (
      <div className={cn("space-y-2 rounded-lg border bg-card p-3", className)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor={id} className="text-base font-medium">
            {label}
          </Label>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            id={id}
            inputMode="decimal"
            autoComplete="off"
            aria-invalid={error ? "true" : "false"}
            className="min-h-11 min-w-[8rem] flex-1 text-base"
            placeholder="—"
            {...registration}
            ref={(el) => {
              registration.ref(el);
              if (typeof ref === "function") ref(el);
              else if (ref) ref.current = el;
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 touch-manipulation"
              onClick={onOpenGuide}
            >
              <BookOpen className="mr-1" />
              How to measure
            </Button>
            <Tooltip>
              <TooltipTrigger
                className="inline-flex"
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11 touch-manipulation"
                    aria-label={`Information about ${label}`}
                  >
                    <HelpCircle />
                  </Button>
                }
              />
              <TooltipContent className="max-w-xs text-xs">{hint}</TooltipContent>
            </Tooltip>
            {showImageButton ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="min-h-11 touch-manipulation"
                onClick={onViewImage ?? onOpenDiagram}
              >
                <ImageIcon className="mr-1" />
                View image
              </Button>
            ) : null}
          </div>
        </div>
        {error ? (
          <p className="text-xs text-destructive" role="alert">
            {error.message}
          </p>
        ) : null}
      </div>
    );
  }
);

export type MeasurementInputProps = Props;
