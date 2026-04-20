import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { CaseRecord } from "@/types/models";

const CASES_DIR = path.join(process.cwd(), "server-data", "cases");
const UPLOADS_PUBLIC_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "cases"
);

async function ensureDirs() {
  await mkdir(CASES_DIR, { recursive: true });
  await mkdir(UPLOADS_PUBLIC_DIR, { recursive: true });
}

function caseFilePath(id: string) {
  return path.join(CASES_DIR, `${id}.json`);
}

function normalizeCaseRecord(parsed: Partial<CaseRecord>): CaseRecord {
  const now = new Date().toISOString();
  return {
    id: parsed.id ?? `${Date.now().toString(36)}-unknown`,
    title: parsed.title ?? "Untitled case",
    createdAt: parsed.createdAt ?? now,
    updatedAt: parsed.updatedAt ?? now,
    patient: {
      patientName: parsed.patient?.patientName ?? "",
      recordId: parsed.patient?.recordId ?? "",
      examDate: parsed.patient?.examDate ?? "",
      weightKg: parsed.patient?.weightKg ?? "",
      breed: parsed.patient?.breed ?? "",
      sex: parsed.patient?.sex ?? "",
      heartRate: parsed.patient?.heartRate ?? "",
      notes: parsed.patient?.notes ?? "",
    },
    measurements: parsed.measurements ?? {},
    reportNotes: parsed.reportNotes ?? "",
    attachments: parsed.attachments ?? [],
  };
}

export async function listCases(): Promise<CaseRecord[]> {
  await ensureDirs();
  const files = await readdir(CASES_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));
  const records: CaseRecord[] = [];

  for (const f of jsonFiles) {
    try {
      const raw = await readFile(path.join(CASES_DIR, f), "utf8");
      const parsed = JSON.parse(raw) as Partial<CaseRecord>;
      records.push(normalizeCaseRecord(parsed));
    } catch {
      // Skip malformed records; do not crash the archive endpoint.
    }
  }

  records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return records;
}

export async function readCase(id: string): Promise<CaseRecord | null> {
  await ensureDirs();
  try {
    const raw = await readFile(caseFilePath(id), "utf8");
    const parsed = JSON.parse(raw) as Partial<CaseRecord>;
    return normalizeCaseRecord(parsed);
  } catch {
    return null;
  }
}

export async function saveCase(record: CaseRecord): Promise<CaseRecord> {
  await ensureDirs();
  const normalized = normalizeCaseRecord(record);
  await writeFile(caseFilePath(record.id), JSON.stringify(normalized, null, 2));
  return normalized;
}

export async function deleteCaseFile(id: string): Promise<void> {
  await ensureDirs();
  await rm(caseFilePath(id), { force: true });
}

export function getUploadsPublicDir(caseId: string) {
  return path.join(UPLOADS_PUBLIC_DIR, caseId);
}

