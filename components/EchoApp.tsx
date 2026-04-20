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
  measurementKeys,
  modelMeasurementsToForm,
  modelPatientToForm,
  type MeasurementFormValues,
  type FullCaseFormValues,
} from "@/lib/schemas";
import { calculateResults, formatNumberOrDash } from "@/lib/calculations";
import { interpretEcho } from "@/lib/interpretation";
import {
  deleteCaseFromServer,
  duplicateCaseOnServer,
  fetchCase,
  fetchCases,
  saveCaseToServer,
  uploadCaseImage,
} from "@/lib/case-api";
import type {
  CaseRecord,
  DiagramViewId,
  MeasurementKey,
  CaseAttachment,
} from "@/types/models";
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
  | "report"
  | "archive";

const DESKTOP_TABS: Array<{ value: TabValue; label: string }> = [
  { value: "patient", label: "Patient" },
  { value: "measurements", label: "Measurements" },
  { value: "calculations", label: "Calculations" },
  { value: "howto", label: "How to measure" },
  { value: "report", label: "Report" },
  { value: "archive", label: "Archive" },
];

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
  existingCreatedAt?: string,
  attachments: CaseAttachment[] = []
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
    attachments,
  };
}

function createEmptyCaseRecord(): CaseRecord {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const values = defaultFullCaseFormValues();
  return buildRecord(id, "Untitled case", values);
}

function demoCaseRecord(): CaseRecord {
  const now = new Date().toISOString();
  return {
    id: "demo-case",
    title: "Demo: mixed-breed adult",
    createdAt: now,
    updatedAt: now,
    patient: {
      patientName: "Demo Dog",
      recordId: "DEMO-001",
      examDate: new Date().toISOString().slice(0, 10),
      weightKg: "22.5",
      breed: "Mixed breed",
      sex: "female",
      heartRate: "110",
      notes: "Example only — replace with real study data.",
    },
    measurements: {
      ao: 2.0,
      la: 2.4,
      lvidD: 4.2,
      lvidS: 2.7,
      ivsD: 0.9,
      ivsS: 1.2,
      lvpwD: 0.9,
      lvpwS: 1.1,
      mitralE: 0.85,
      mitralA: 0.55,
    },
    reportNotes: "Illustrative values for UI testing; not a clinical interpretation.",
    attachments: [],
  };
}

function caseDataFingerprint(
  id: string,
  title: string,
  values: FullCaseFormValues,
  attachments: CaseAttachment[]
) {
  return JSON.stringify({
    id,
    title: title.trim() || "Untitled case",
    patient: formPatientToModel(values),
    measurements: formMeasurementsToModel(values),
    reportNotes: values.reportNotes ?? "",
    attachments: attachments.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      storedName: a.storedName ?? "",
      url: a.url,
      uploadedAt: a.uploadedAt,
    })),
  });
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
  const [calcRefresh, setCalcRefresh] = React.useState(0);
  const [lastRecalculatedAt, setLastRecalculatedAt] = React.useState<string | null>(
    null
  );
  const [showActiveGuide, setShowActiveGuide] = React.useState(false);
  const [attachments, setAttachments] = React.useState<CaseAttachment[]>([]);
  const [isHydratingCase, setIsHydratingCase] = React.useState(false);
  const [archiveError, setArchiveError] = React.useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(true);
  const lastSavedFingerprintRef = React.useRef<string>("");
  const inFlightFingerprintRef = React.useRef<string>("");

  const form = useForm<FullCaseFormValues>({
    resolver: zodResolver(
      fullCaseFormSchema
    ) as Resolver<FullCaseFormValues>,
    defaultValues: defaultFullCaseFormValues(),
    mode: "onChange",
    shouldUnregister: false,
  });

  const { register, control, reset, formState } = form;
  const watched = useWatch({ control });
  const watchedMeasurementValues = useWatch({
    control,
    name: measurementKeys,
  });
  const liveValues = React.useMemo(
    () =>
      ({
        ...defaultFullCaseFormValues(),
        ...form.getValues(),
        ...(watched ?? {}),
      }) as FullCaseFormValues,
    [form, watched]
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncViewportMode = () => setIsDesktop(mediaQuery.matches);
    syncViewportMode();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncViewportMode);
      return () => mediaQuery.removeEventListener("change", syncViewportMode);
    }
    mediaQuery.addListener(syncViewportMode);
    return () => mediaQuery.removeListener(syncViewportMode);
  }, []);

  React.useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        let all = await fetchCases();
        if (all.length === 0) {
          await saveCaseToServer(demoCaseRecord());
          all = await fetchCases();
        }
        if (ignore) return;
        setCases(all);
        setCaseId(all[0]?.id ?? null);
        setArchiveError(null);
      } catch (error) {
        if (ignore) return;
        setArchiveError(
          error instanceof Error ? error.message : "Failed to load case archive."
        );
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  React.useEffect(() => {
    if (!caseId) return;
    let ignore = false;
    setIsHydratingCase(true);
    const load = async () => {
      try {
        const rec = await fetchCase(caseId);
        if (ignore) return;
        setCaseTitle(rec.title);
        setAttachments(rec.attachments ?? []);
        lastSavedFingerprintRef.current = caseDataFingerprint(
          rec.id,
          rec.title,
          {
            ...defaultFullCaseFormValues(),
            ...modelPatientToForm(rec.patient),
            ...modelMeasurementsToForm(rec.measurements),
            reportNotes: rec.reportNotes ?? "",
          },
          rec.attachments ?? []
        );
        inFlightFingerprintRef.current = "";
        reset({
          ...defaultFullCaseFormValues(),
          ...modelPatientToForm(rec.patient),
          ...modelMeasurementsToForm(rec.measurements),
          reportNotes: rec.reportNotes ?? "",
        });
      } catch (error) {
        if (!ignore) {
          setArchiveError(
            error instanceof Error ? error.message : "Failed to load selected case."
          );
        }
      } finally {
        if (!ignore) setIsHydratingCase(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [caseId, reset]);

  useDebouncedEffect(
    () => {
      if (!caseId || isHydratingCase) return;
      const values = liveValues;
      const fingerprint = caseDataFingerprint(caseId, caseTitle, values, attachments);
      if (fingerprint === lastSavedFingerprintRef.current) return;
      if (fingerprint === inFlightFingerprintRef.current) return;
      const existing = cases.find((c) => c.id === caseId);
      const rec = buildRecord(caseId, caseTitle, values, existing?.createdAt, attachments);
      inFlightFingerprintRef.current = fingerprint;
      saveCaseToServer(rec)
        .then((saved) => {
          const savedFingerprint = caseDataFingerprint(
            saved.id,
            saved.title,
            {
              ...defaultFullCaseFormValues(),
              ...modelPatientToForm(saved.patient),
              ...modelMeasurementsToForm(saved.measurements),
              reportNotes: saved.reportNotes ?? "",
            },
            saved.attachments ?? []
          );
          lastSavedFingerprintRef.current = savedFingerprint;
          if (inFlightFingerprintRef.current === fingerprint) {
            inFlightFingerprintRef.current = "";
          }
          setCases((prev) => {
            const idx = prev.findIndex((c) => c.id === saved.id);
            if (idx === -1) return [saved, ...prev];
            const next = [...prev];
            next[idx] = saved;
            next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
            return next;
          });
        })
        .catch((error) => {
          if (inFlightFingerprintRef.current === fingerprint) {
            inFlightFingerprintRef.current = "";
          }
          setArchiveError(
            error instanceof Error ? error.message : "Failed to save case."
          );
        });
    },
    [liveValues, caseId, caseTitle, isHydratingCase, attachments, cases],
    500
  );

  const measurementFormValues = React.useMemo(() => {
    const values = {} as MeasurementFormValues;
    measurementKeys.forEach((key, index) => {
      values[key] = (watchedMeasurementValues?.[index] ??
        liveValues[key] ??
        "") as string;
    });
    return values;
  }, [watchedMeasurementValues, liveValues]);

  const measurementsModel = React.useMemo(
    () => formMeasurementsToModel(measurementFormValues),
    [measurementFormValues]
  );

  const calculated = React.useMemo(
    () => {
      void calcRefresh;
      return calculateResults(measurementsModel);
    },
    [measurementsModel, calcRefresh]
  );

  const interpretation = React.useMemo(
    () => interpretEcho(measurementsModel, calculated),
    [measurementsModel, calculated]
  );

  const currentRecord = React.useMemo(() => {
    if (!caseId) return null;
    const values = liveValues;
    const createdAt = cases.find((c) => c.id === caseId)?.createdAt;
    return buildRecord(caseId, caseTitle, values, createdAt, attachments);
  }, [caseId, caseTitle, liveValues, cases, attachments]);

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

  const refreshCases = async () => {
    const all = await fetchCases();
    setCases(all);
    return all;
  };

  const handleNewCase = async () => {
    const rec = createEmptyCaseRecord();
    lastSavedFingerprintRef.current = caseDataFingerprint(
      rec.id,
      rec.title,
      {
        ...defaultFullCaseFormValues(),
        reportNotes: rec.reportNotes,
      } as FullCaseFormValues,
      rec.attachments ?? []
    );
    inFlightFingerprintRef.current = "";
    setIsHydratingCase(true);
    reset(defaultFullCaseFormValues());
    setAttachments([]);
    await saveCaseToServer(rec);
    const all = await refreshCases();
    setCaseId(rec.id);
    setCaseTitle(rec.title);
    setTab("patient");
    setIsHydratingCase(false);
    setArchiveError(null);
    if (all.length === 0) setCases([rec]);
  };

  const handleDuplicate = async () => {
    if (!caseId) return;
    const copy = await duplicateCaseOnServer(caseId);
    await refreshCases();
    setCaseId(copy.id);
    setCaseTitle(copy.title);
    setArchiveError(null);
  };

  const handleDelete = async () => {
    if (!caseId) return;
    if (!window.confirm("Delete this case from the server archive?")) return;
    await deleteCaseFromServer(caseId);
    const all = await refreshCases();
    const next = all[0]?.id ?? null;
    setCaseId(next);
    if (!next) {
      inFlightFingerprintRef.current = "";
      lastSavedFingerprintRef.current = "";
      reset(defaultFullCaseFormValues());
      setCaseTitle("Untitled case");
      setAttachments([]);
    }
    setArchiveError(null);
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

  const handleImageUpload = async (files: FileList | null) => {
    if (!caseId || !files || files.length === 0) return;
    setUploadingImage(true);
    try {
      let latest: CaseRecord | null = null;
      for (const file of Array.from(files)) {
        latest = await uploadCaseImage(caseId, file);
      }
      if (latest) {
        setAttachments(latest.attachments ?? []);
        lastSavedFingerprintRef.current = caseDataFingerprint(
          latest.id,
          latest.title,
          {
            ...defaultFullCaseFormValues(),
            ...modelPatientToForm(latest.patient),
            ...modelMeasurementsToForm(latest.measurements),
            reportNotes: latest.reportNotes ?? "",
          },
          latest.attachments ?? []
        );
        inFlightFingerprintRef.current = "";
        await refreshCases();
      }
      setArchiveError(null);
    } catch (error) {
      setArchiveError(
        error instanceof Error ? error.message : "Failed to upload image."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRecalculateNow = React.useCallback(() => {
    form.trigger(measurementKeys);
    setCalcRefresh((v) => v + 1);
    setLastRecalculatedAt(new Date().toLocaleTimeString());
  }, [form]);

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
    <Card className="w-full border-border/80">
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
            className="w-full min-h-11 text-base"
            value={caseTitle}
            onChange={(e) => setCaseTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="patientName">Patient name</Label>
          <Input
            id="patientName"
            className="w-full min-h-11 text-base"
            {...register("patientName")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recordId">ID / record number</Label>
          <Input
            id="recordId"
            className="w-full min-h-11 text-base"
            {...register("recordId")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="examDate">Date</Label>
          <Input
            id="examDate"
            type="date"
            className="w-full min-h-11 text-base"
            {...register("examDate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weightKg">Weight (kg)</Label>
          <Input
            id="weightKg"
            inputMode="decimal"
            className="w-full min-h-11 text-base"
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
            className="w-full min-h-11 text-base"
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
            <option value="male_neuter">Male neuter</option>
            <option value="female">Female</option>
            <option value="female_neuter">Female neuter</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="heartRate">Heart rate (bpm)</Label>
          <Input
            id="heartRate"
            inputMode="numeric"
            className="w-full min-h-11 text-base"
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
            className="w-full min-h-24 text-base"
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
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={quickMode ? "default" : "outline"}
            size="sm"
            className="min-h-10"
            onClick={() => setQuickMode(true)}
          >
            Quick mode
          </Button>
          <Button
            type="button"
            variant={!quickMode ? "default" : "outline"}
            size="sm"
            className="min-h-10"
            onClick={() => setQuickMode(false)}
          >
            Advanced mode
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {quickMode
            ? "Quick shows Ao, LA, LVIDd, LVIDs, IVSd, LVPWd."
            : "Advanced includes IVSs, LVPWs, LV length, mitral E/A, and aortic velocity."}
        </p>
      </div>

      {focusedGuide && showActiveGuide ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Active field guide
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowActiveGuide(false)}
            >
              Hide guide
            </Button>
          </div>
          <GuideCard
            guide={focusedGuide}
            onShowOnDiagram={() =>
              openDiagramForKey(focusedGuide.key, Boolean(focusedGuide.localImagePath))
            }
          />
        </div>
      ) : focusedGuide ? (
        <div className="rounded-lg border border-border/80 bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Active guide selected: <span className="font-medium">{focusedGuide.shortLabel}</span>
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowActiveGuide(true)}
            >
              Show guide
            </Button>
          </div>
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
            onOpenGuide={() => {
              setFocusedKey(g.key);
              setShowActiveGuide(true);
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
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={handleRecalculateNow}
        >
          Recalculate now
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-h-11"
          onClick={() => setTab("measurements")}
        >
          Back to measurements
        </Button>
      </div>
      {lastRecalculatedAt ? (
        <p className="text-xs text-muted-foreground">
          Recalculated at {lastRecalculatedAt}
        </p>
      ) : null}
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
            className="w-full min-h-28 text-base"
            {...register("reportNotes")}
          />
        </div>
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>Attached images</CardTitle>
            <CardDescription>
              Uploaded images are stored on the server and referenced in this case JSON.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                handleImageUpload(e.currentTarget.files);
                e.currentTarget.value = "";
              }}
              disabled={!caseId || uploadingImage}
            />
            {uploadingImage ? (
              <p className="text-xs text-muted-foreground">Uploading image(s)...</p>
            ) : null}
            {(attachments ?? []).length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {attachments.map((img) => (
                  <a
                    key={img.id}
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="space-y-1 rounded border p-2 text-xs"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.fileName}
                      className="h-24 w-full rounded object-cover"
                    />
                    <p className="truncate">{img.fileName}</p>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No images attached to this case yet.
              </p>
            )}
          </CardContent>
        </Card>
        <ReportView
          record={currentRecord}
          calculated={calculated}
          interpretation={interpretation}
        />
      </div>
    ) : null;

  const archiveSection = (
    <Card className="w-full border-border/80">
      <CardHeader>
        <CardTitle>Archive</CardTitle>
        <CardDescription>
          JSON cases are stored under <code>server-data/cases</code> on the server.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {archiveError ? (
          <p className="rounded border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
            {archiveError}
          </p>
        ) : null}
        <Button type="button" variant="outline" onClick={() => refreshCases()}>
          Refresh archive
        </Button>
        <div className="space-y-2">
          {cases.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border p-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">
                  {c.id}.json · updated {new Date(c.updatedAt).toLocaleString()}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant={caseId === c.id ? "default" : "outline"}
                onClick={() => {
                  setIsHydratingCase(true);
                  setCaseId(c.id);
                  setTab("patient");
                }}
              >
                Open
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const summaryPanel = (
    <CalculationCard
      className="print:hidden"
      title="Live summary"
      rows={calcRows.slice(0, 4)}
      warnings={calculated.warnings}
    />
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
              onChange={(e) => {
                setIsHydratingCase(true);
                setCaseId(e.target.value || null);
              }}
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

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-4 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="flex-1 space-y-4">
          {isDesktop ? (
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-2 rounded-lg border bg-card p-2">
                {DESKTOP_TABS.map((t) => (
                  <Button
                    key={t.value}
                    type="button"
                    variant={tab === t.value ? "default" : "outline"}
                    className="min-h-11"
                    onClick={() => setTab(t.value)}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
              <section aria-hidden={tab !== "patient"} className={tab === "patient" ? "block" : "hidden"}>
                {patientSection}
              </section>
              <section
                aria-hidden={tab !== "measurements"}
                className={tab === "measurements" ? "block" : "hidden"}
              >
                {measurementsSection}
              </section>
              <section
                aria-hidden={tab !== "calculations"}
                className={tab === "calculations" ? "block" : "hidden"}
              >
                {calculationsSection}
              </section>
              <section aria-hidden={tab !== "howto"} className={tab === "howto" ? "block" : "hidden"}>
                {howtoSection}
              </section>
              <section aria-hidden={tab !== "report"} className={tab === "report" ? "block" : "hidden"}>
                {reportSection}
              </section>
              <section aria-hidden={tab !== "archive"} className={tab === "archive" ? "block" : "hidden"}>
                {archiveSection}
              </section>
            </div>
          ) : (
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
              <AccordionItem value="archive">
                <AccordionTrigger className="min-h-12 text-base">
                  Archive
                </AccordionTrigger>
                <AccordionContent>{archiveSection}</AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
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
