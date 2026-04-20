"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Printer, FileJson, Copy, Trash2, Plus, Activity } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { measurementGuideByKey, measurementGuides } from "@/data/measurementGuides";
import {
  defaultFullCaseFormValues,
  formMeasurementsToModel,
  formPatientToModel,
  fullCaseFormSchema,
  modelMeasurementsToForm,
  modelPatientToForm,
  type FullCaseFormValues,
} from "@/lib/schemas";
import { calculateResults, formatNumberOrDash } from "@/lib/calculations";
import { interpretEcho } from "@/lib/interpretation";
import {
  deleteCase,
  duplicateCase,
  ensureDemoCaseSeeded,
  getCurrentCaseId,
  loadAllCases,
  newEmptyCase,
  setCurrentCaseId,
  upsertCase,
} from "@/lib/case-storage";
import type { CaseRecord, DiagramViewId, MeasurementKey } from "@/types/models";
import { AppDisclaimer } from "@/components/AppDisclaimer";
import { CalculationCard } from "@/components/CalculationCard";
import { DiagramForGuide } from "@/components/DiagramForGuide";
import { DiagramModal } from "@/components/DiagramModal";
import { GuideCard } from "@/components/GuideCard";
import { InterpretationAlert } from "@/components/InterpretationAlert";
import { MeasurementInput } from "@/components/MeasurementInput";
import { ReportView } from "@/components/ReportView";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";

/** Fields visible in quick (essential-only) entry mode. */
const QUICK_KEYS = new Set<MeasurementKey>([
  "ao",
  "la",
  "lvidD",
  "lvidS",
  "ivsD",
  "lvpwD",
]);

type TabValue =
  | "patient"
  | "measurements"
  | "calculations"
  | "howto"
  | "report";

function useDebouncedEffect(
  fn: () => void,
  deps: React.DependencyList,
  delay: number
) {
  React.useEffect(() => {
    const t = window.setTimeout(fn, delay);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}

function buildRecord(
  id: string,
  title: string,
  values: FullCaseFormValues,
  existingCreatedAt?: string
): CaseRecord {
  const now = new Date().toISOString();
  return {
    id,
    title: title.trim() || "Untitled case",
    createdAt: existingCreatedAt ?? now,
    updatedAt: now,
    patient: formPatientToModel(values),
    measurements: formMeasurementsToModel(values),
    reportNotes: values.reportNotes ?? "",
  };
}

export function EchoApp() {
  const [cases, setCases] = React.useState<CaseRecord[]>([]);
  const [caseId, setCaseId] = React.useState<string | null>(null);
  const [caseTitle, setCaseTitle] = React.useState("Untitled case");
  const [quickMode, setQuickMode] = React.useState(true);
  const [tab, setTab] = React.useState<TabValue>("patient");
  const [focusedKey, setFocusedKey] = React.useState<MeasurementKey | null>(
    null
  );
  const [diagramOpen, setDiagramOpen] = React.useState(false);
  const [diagramTitle, setDiagramTitle] = React.useState("");
  const [diagramView, setDiagramView] =
    React.useState<DiagramViewId>("heartBaseSax");
  const [diagramHighlight, setDiagramHighlight] = React.useState<string | null>(
    null
  );
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);

  const form = useForm<FullCaseFormValues>({
    resolver: zodResolver(
      fullCaseFormSchema
    ) as Resolver<FullCaseFormValues>,
    defaultValues: defaultFullCaseFormValues(),
    mode: "onChange",
  });

  const { register, control, reset, formState } = form;
  const watched = useWatch({ control });

  React.useEffect(() => {
    ensureDemoCaseSeeded();
    const all = loadAllCases();
    setCases(all);
    const id = getCurrentCaseId() ?? all[0]?.id ?? null;
    setCaseId(id);
  }, []);

  React.useEffect(() => {
    if (!caseId) return;
    const rec = loadAllCases().find((c) => c.id === caseId);
    if (!rec) return;
    setCaseTitle(rec.title);
    reset({
      ...modelPatientToForm(rec.patient),
      ...modelMeasurementsToForm(rec.measurements),
      reportNotes: rec.reportNotes ?? "",
    });
    setCurrentCaseId(caseId);
  }, [caseId, reset]);

  useDebouncedEffect(
    () => {
      if (!caseId) return;
      const values = form.getValues();
      const existing = loadAllCases().find((c) => c.id === caseId);
      const rec = buildRecord(
        caseId,
        caseTitle,
        values,
        existing?.createdAt
      );
      upsertCase(rec);
      setCases(loadAllCases());
    },
    [watched, caseId, caseTitle, form],
    500
  );

  const measurementsModel = React.useMemo(
    () => formMeasurementsToModel(watched as FullCaseFormValues),
    [watched]
  );

  const calculated = React.useMemo(
    () => calculateResults(measurementsModel),
    [measurementsModel]
  );

  const interpretation = React.useMemo(
    () => interpretEcho(measurementsModel, calculated),
    [measurementsModel, calculated]
  );

  const currentRecord = React.useMemo(() => {
    if (!caseId) return null;
    const values = (watched ?? form.getValues()) as FullCaseFormValues;
    const createdAt = cases.find((c) => c.id === caseId)?.createdAt;
    return buildRecord(caseId, caseTitle, values, createdAt);
  }, [caseId, caseTitle, watched, cases, form]);

  const openDiagramForKey = (key: MeasurementKey, preferImage?: boolean) => {
    const g = measurementGuideByKey[key];
    setDiagramTitle(g.title);
    setDiagramView(g.diagramView);
    setDiagramHighlight(g.diagramHighlight ?? null);
    if (preferImage && g.localImagePath) {
      setImageSrc(g.localImagePath);
    } else {
      setImageSrc(null);
    }
    setDiagramOpen(true);
  };

  const refreshCases = () => setCases(loadAllCases());

  const handleNewCase = () => {
    const rec = newEmptyCase();
    upsertCase(rec);
    refreshCases();
    setCaseId(rec.id);
    setCaseTitle(rec.title);
    setTab("patient");
  };

  const handleDuplicate = () => {
    if (!caseId) return;
    const copy = duplicateCase(caseId);
    if (copy) {
      refreshCases();
      setCaseId(copy.id);
      setCaseTitle(copy.title);
    }
  };

  const handleDelete = () => {
    if (!caseId) return;
    if (!window.confirm("Delete this case from this browser?")) return;
    deleteCase(caseId);
    refreshCases();
    const next = loadAllCases()[0]?.id ?? null;
    setCaseId(next);
    if (next) {
      const rec = loadAllCases().find((c) => c.id === next);
      if (rec) setCaseTitle(rec.title);
    }
  };

  const handleExportJson = () => {
    if (!currentRecord) return;
    const blob = new Blob([JSON.stringify(currentRecord, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `canine-echo-${currentRecord.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    setTab("report");
    window.setTimeout(() => {
      document.body.classList.add("echo-print-report");
      window.print();
      document.body.classList.remove("echo-print-report");
    }, 200);
  };

  const calcRows = [
    {
      label: "LA:Ao",
      value: formatNumberOrDash(calculated.laAoRatio),
    },
    {
      label: "FS%",
      value: formatNumberOrDash(calculated.fsPercent, "%"),
    },
    { label: "E:A", value: formatNumberOrDash(calculated.eaRatio) },
    {
      label: "Wall thickness",
      value: calculated.wallThicknessSummary ?? "—",
    },
    {
      label: "LV geometry check",
      value: calculated.geometryFlags.lvidInconsistent ? "Unusual" : "OK",
      flag: calculated.geometryFlags.lvidInconsistent,
    },
    {
      label: "IVS timing check",
      value: calculated.geometryFlags.ivsInconsistent ? "Unusual" : "OK",
      flag: calculated.geometryFlags.ivsInconsistent,
    },
    {
      label: "LVPW timing check",
      value: calculated.geometryFlags.lvpwInconsistent ? "Unusual" : "OK",
      flag: calculated.geometryFlags.lvpwInconsistent,
    },
  ];

  const patientSection = (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle>Patient / case details</CardTitle>
        <CardDescription>
          Demographics for the worksheet and printed report.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="caseTitle">Case title</Label>
          <Input
            id="caseTitle"
            className="min-h-11 text-base"
            value={caseTitle}
            onChange={(e) => setCaseTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="patientName">Patient name</Label>
          <Input
            id="patientName"
            className="min-h-11 text-base"
            {...register("patientName")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recordId">ID / record number</Label>
          <Input
            id="recordId"
            className="min-h-11 text-base"
            {...register("recordId")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="examDate">Date</Label>
          <Input
            id="examDate"
            type="date"
            className="min-h-11 text-base"
            {...register("examDate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weightKg">Weight (kg)</Label>
          <Input
            id="weightKg"
            inputMode="decimal"
            className="min-h-11 text-base"
            {...register("weightKg")}
          />
          {formState.errors.weightKg ? (
            <p className="text-xs text-destructive">
              {formState.errors.weightKg.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="breed">Breed</Label>
          <Input
            id="breed"
            className="min-h-11 text-base"
            {...register("breed")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sex">Sex</Label>
          <select
            id="sex"
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-base"
            {...register("sex")}
          >
            <option value="">—</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="heartRate">Heart rate (bpm)</Label>
          <Input
            id="heartRate"
            inputMode="numeric"
            className="min-h-11 text-base"
            {...register("heartRate")}
          />
          {formState.errors.heartRate ? (
            <p className="text-xs text-destructive">
              {formState.errors.heartRate.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            className="min-h-24 text-base"
            {...register("notes")}
          />
        </div>
      </CardContent>
    </Card>
  );

  const measurementFields = measurementGuides.filter((g) => {
    if (!quickMode) return true;
    return QUICK_KEYS.has(g.key);
  });

  const focusedGuide = focusedKey ? measurementGuideByKey[focusedKey] : null;

  const measurementsSection = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3">
        <div className="flex items-center gap-3">
          <Switch
            checked={quickMode}
            onCheckedChange={setQuickMode}
            id="quick-mode"
          />
          <Label htmlFor="quick-mode" className="text-base">
            Quick mode (Ao, LA, LVIDd, LVIDs, IVSd, LVPWd only)
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Turn off to enter IVSs, LVPWs, LV length, mitral E/A, and aortic
          velocity.
        </p>
      </div>

      {focusedGuide ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
            Active field guide
          </p>
          <GuideCard
            guide={focusedGuide}
            onShowOnDiagram={() =>
              openDiagramForKey(focusedGuide.key, Boolean(focusedGuide.localImagePath))
            }
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Tap a measurement field to show its full guide here.
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {measurementFields.map((g) => (
          <MeasurementInput
            key={g.key}
            id={g.key}
            label={g.title}
            unit={g.unit}
            hint={g.significance}
            registration={register(g.key)}
            error={formState.errors[g.key]}
            onFieldFocus={() => setFocusedKey(g.key)}
            onOpenGuide={() => {
              setFocusedKey(g.key);
              setTab("howto");
            }}
            onOpenDiagram={() => openDiagramForKey(g.key)}
            onViewImage={() => openDiagramForKey(g.key, true)}
            showImageButton
          />
        ))}
      </div>

    </div>
  );

  const calculationsSection = (
    <div className="space-y-4">
      <InterpretationAlert bundle={interpretation} />
      <CalculationCard rows={calcRows} warnings={calculated.warnings} />
    </div>
  );

  const howtoSection = (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Browse all measurement instructions below, or use{" "}
        <Link className="font-medium text-primary underline" href="/guides">
          the searchable Measurement Guide
        </Link>
        .
      </p>
      {measurementGuides.map((g) => (
        <GuideCard
          key={g.key}
          guide={g}
          onShowOnDiagram={() => openDiagramForKey(g.key)}
        />
      ))}
    </div>
  );

  const reportSection =
    currentRecord ? (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button
            type="button"
            className="min-h-11"
            onClick={handlePrint}
          >
            <Printer className="mr-2" />
            Print / Save as PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={handleExportJson}
          >
            <FileJson className="mr-2" />
            Export JSON
          </Button>
        </div>
        <div className="space-y-2 print:hidden">
          <Label htmlFor="reportNotes">Report notes</Label>
          <Textarea
            id="reportNotes"
            className="min-h-28 text-base"
            {...register("reportNotes")}
          />
        </div>
        <ReportView
          record={currentRecord}
          calculated={calculated}
          interpretation={interpretation}
        />
      </div>
    ) : null;

  const summaryPanel = (
    <CalculationCard
      className="print:hidden"
      title="Live summary"
      rows={calcRows.slice(0, 4)}
      warnings={calculated.warnings}
    />
  );

  const tabPanel = (value: TabValue, content: React.ReactNode) => (
    <TabsContent value={value} className="mt-4">
      {content}
    </TabsContent>
  );

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="echo-no-print border-b bg-card print:hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-md bg-primary/10 p-2 text-primary">
              <Activity className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                Canine Echo Helper
              </h1>
              <p className="text-sm text-muted-foreground">
                Chairside calculator and reference for canine cardiac ultrasound.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-muted-foreground">Case</label>
            <select
              className="h-11 min-w-[10rem] rounded-lg border border-input bg-background px-2 text-sm"
              value={caseId ?? ""}
              onChange={(e) => setCaseId(e.target.value || null)}
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="min-h-11"
              onClick={handleNewCase}
            >
              <Plus className="mr-1" />
              New
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="min-h-11"
              onClick={handleDuplicate}
            >
              <Copy className="mr-1" />
              Duplicate
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="min-h-11"
              onClick={handleDelete}
            >
              <Trash2 className="mr-1" />
              Delete
            </Button>
            <Link
              href="/guides"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "inline-flex min-h-11 items-center justify-center no-underline"
              )}
            >
              Measurement guide
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-4">
          <div className="hidden lg:block">
            <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
              <TabsList className="flex h-auto w-full flex-wrap gap-1">
                <TabsTrigger value="patient" className="min-h-11 flex-1">
                  Patient
                </TabsTrigger>
                <TabsTrigger value="measurements" className="min-h-11 flex-1">
                  Measurements
                </TabsTrigger>
                <TabsTrigger value="calculations" className="min-h-11 flex-1">
                  Calculations
                </TabsTrigger>
                <TabsTrigger value="howto" className="min-h-11 flex-1">
                  How to measure
                </TabsTrigger>
                <TabsTrigger value="report" className="min-h-11 flex-1">
                  Report
                </TabsTrigger>
              </TabsList>
              {tabPanel("patient", patientSection)}
              {tabPanel("measurements", measurementsSection)}
              {tabPanel("calculations", calculationsSection)}
              {tabPanel("howto", howtoSection)}
              {tabPanel("report", reportSection)}
            </Tabs>
          </div>

          <div className="lg:hidden">
            <Accordion multiple={false} defaultValue={["patient"]}>
              <AccordionItem value="patient">
                <AccordionTrigger className="min-h-12 text-base">
                  Patient / case details
                </AccordionTrigger>
                <AccordionContent>{patientSection}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="measurements">
                <AccordionTrigger className="min-h-12 text-base">
                  Measurements
                </AccordionTrigger>
                <AccordionContent>{measurementsSection}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="calculations">
                <AccordionTrigger className="min-h-12 text-base">
                  Calculations & interpretation
                </AccordionTrigger>
                <AccordionContent>{calculationsSection}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="howto">
                <AccordionTrigger className="min-h-12 text-base">
                  How to measure
                </AccordionTrigger>
                <AccordionContent>{howtoSection}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="report">
                <AccordionTrigger className="min-h-12 text-base">
                  Report
                </AccordionTrigger>
                <AccordionContent>{reportSection}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <aside className="echo-no-print print:hidden lg:sticky lg:top-4 lg:w-80 lg:shrink-0">
          {summaryPanel}
        </aside>
      </main>

      <div className="echo-no-print print:hidden">
        <AppDisclaimer />
      </div>

      <DiagramModal
        open={diagramOpen}
        onOpenChange={setDiagramOpen}
        title={diagramTitle}
      >
        <div className="space-y-4">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={diagramTitle}
              className="mx-auto max-h-[50vh] w-auto rounded-md border object-contain"
              onError={() => setImageSrc(null)}
            />
          ) : null}
          <DiagramForGuide view={diagramView} highlight={diagramHighlight} />
          {!imageSrc ? (
            <p className="text-center text-xs text-muted-foreground">
              {/* TODO: add your own images under public/guides and set localImagePath in data/measurementGuides.ts */}
              Schematic fallback. Add files to{" "}
              <code className="rounded bg-muted px-1">public/guides</code> and
              reference them in measurement guide data.
            </p>
          ) : null}
        </div>
      </DiagramModal>
    </div>
  );
}
