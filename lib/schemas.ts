import { z } from "zod";

import type { MeasurementKey, Measurements, PatientDetails } from "@/types/models";

export const patientSchema = z.object({
  patientName: z.string().default(""),
  recordId: z.string().default(""),
  examDate: z.string().default(""),
  weightKg: z
    .string()
    .default("")
    .refine(
      (s) => s.trim() === "" || !Number.isNaN(Number(s)),
      "Numbers only"
    ),
  breed: z.string().default(""),
  sex: z
    .union([
      z.literal(""),
      z.literal("male"),
      z.literal("male_neuter"),
      z.literal("female"),
      z.literal("female_neuter"),
      z.literal("unknown"),
    ])
    .default(""),
  heartRate: z
    .string()
    .default("")
    .refine(
      (s) => s.trim() === "" || !Number.isNaN(Number(s)),
      "Numbers only"
    ),
  notes: z.string().default(""),
});

export type PatientFormValues = z.infer<typeof patientSchema>;

export const measurementKeys: MeasurementKey[] = [
  "ao",
  "la",
  "lvidD",
  "lvidS",
  "ivsD",
  "ivsS",
  "lvpwD",
  "lvpwS",
  "lvLength",
  "mitralE",
  "mitralA",
  "aorticVelocity",
];

const measurementField = z
  .string()
  .default("")
  .refine(
    (s) => s.trim() === "" || /^-?\d*(\.\d+)?$/.test(s.trim()),
    "Numbers only"
  );

export const measurementsSchema = z.object(
  Object.fromEntries(
    measurementKeys.map((k) => [k, measurementField])
  ) as Record<MeasurementKey, typeof measurementField>
);

export type MeasurementFormValues = z.infer<typeof measurementsSchema>;

export const reportNotesSchema = z.object({
  reportNotes: z.string().default(""),
});

export const fullCaseFormSchema = patientSchema
  .merge(measurementsSchema)
  .merge(reportNotesSchema);

export type FullCaseFormValues = z.infer<typeof fullCaseFormSchema>;

export const defaultReportNotesValues = () => ({
  reportNotes: "",
});

export const defaultPatientValues = (): PatientFormValues => ({
  patientName: "",
  recordId: "",
  examDate: new Date().toISOString().slice(0, 10),
  weightKg: "",
  breed: "",
  sex: "",
  heartRate: "",
  notes: "",
});

export const defaultMeasurementValues = (): MeasurementFormValues => ({
  ao: "",
  la: "",
  lvidD: "",
  lvidS: "",
  ivsD: "",
  ivsS: "",
  lvpwD: "",
  lvpwS: "",
  lvLength: "",
  mitralE: "",
  mitralA: "",
  aorticVelocity: "",
});

export function formPatientToModel(v: PatientFormValues): PatientDetails {
  return {
    patientName: v.patientName,
    recordId: v.recordId,
    examDate: v.examDate,
    weightKg: v.weightKg ?? "",
    breed: v.breed,
    sex: v.sex,
    heartRate: v.heartRate ?? "",
    notes: v.notes,
  };
}

export function defaultFullCaseFormValues(): FullCaseFormValues {
  return {
    ...defaultPatientValues(),
    ...defaultMeasurementValues(),
    ...defaultReportNotesValues(),
  };
}

export function modelPatientToForm(p: PatientDetails): PatientFormValues {
  return {
    patientName: p.patientName ?? "",
    recordId: p.recordId ?? "",
    examDate: p.examDate ?? "",
    weightKg: p.weightKg ?? "",
    breed: p.breed ?? "",
    sex: p.sex ?? "",
    heartRate: p.heartRate ?? "",
    notes: p.notes ?? "",
  };
}

export function formMeasurementsToModel(
  v: MeasurementFormValues
): Measurements {
  const out: Measurements = {};
  for (const key of measurementKeys) {
    const raw = v[key]?.trim();
    if (!raw) continue;
    const n = Number(raw);
    if (Number.isFinite(n)) out[key] = n;
  }
  return out;
}

export function modelMeasurementsToForm(m: Measurements): MeasurementFormValues {
  const str = (n?: number) =>
    n === undefined || Number.isNaN(n) ? "" : String(n);
  return {
    ao: str(m.ao),
    la: str(m.la),
    lvidD: str(m.lvidD),
    lvidS: str(m.lvidS),
    ivsD: str(m.ivsD),
    ivsS: str(m.ivsS),
    lvpwD: str(m.lvpwD),
    lvpwS: str(m.lvpwS),
    lvLength: str(m.lvLength),
    mitralE: str(m.mitralE),
    mitralA: str(m.mitralA),
    aorticVelocity: str(m.aorticVelocity),
  };
}
