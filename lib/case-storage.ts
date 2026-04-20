import type { CaseRecord, Measurements, PatientDetails } from "@/types/models";

const STORAGE_KEY = "canine-echo-helper-cases";
const CURRENT_ID_KEY = "canine-echo-helper-current-id";
const SEEDED_KEY = "canine-echo-helper-seeded-demo";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadAllCases(): CaseRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CaseRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAllCases(cases: CaseRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

export function getCurrentCaseId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_ID_KEY);
}

export function setCurrentCaseId(id: string | null) {
  if (id === null) localStorage.removeItem(CURRENT_ID_KEY);
  else localStorage.setItem(CURRENT_ID_KEY, id);
}

export function upsertCase(record: CaseRecord) {
  const all = loadAllCases();
  const idx = all.findIndex((c) => c.id === record.id);
  if (idx === -1) all.push(record);
  else all[idx] = record;
  saveAllCases(all);
}

export function deleteCase(id: string) {
  const all = loadAllCases().filter((c) => c.id !== id);
  saveAllCases(all);
  if (getCurrentCaseId() === id) {
    const next = all[0]?.id ?? null;
    setCurrentCaseId(next);
  }
}

export function duplicateCase(id: string): CaseRecord | null {
  const source = loadAllCases().find((c) => c.id === id);
  if (!source) return null;
  const copy: CaseRecord = {
    ...source,
    id: uid(),
    title: `${source.title} (copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  upsertCase(copy);
  setCurrentCaseId(copy.id);
  return copy;
}

export function ensureDemoCaseSeeded() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEEDED_KEY)) return;
  const demo: CaseRecord = {
    id: "demo-case",
    title: "Demo: mixed-breed adult",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
  };
  const existing = loadAllCases();
  if (!existing.some((c) => c.id === demo.id)) {
    saveAllCases([demo, ...existing]);
  }
  localStorage.setItem(SEEDED_KEY, "1");
  if (!getCurrentCaseId()) setCurrentCaseId(demo.id);
}

export function newEmptyCase(): CaseRecord {
  const id = uid();
  const now = new Date().toISOString();
  return {
    id,
    title: "Untitled case",
    createdAt: now,
    updatedAt: now,
    patient: {
      patientName: "",
      recordId: "",
      examDate: new Date().toISOString().slice(0, 10),
      weightKg: "",
      breed: "",
      sex: "",
      heartRate: "",
      notes: "",
    },
    measurements: {},
    reportNotes: "",
  };
}

export function measurementsFromCase(m: Measurements): Measurements {
  return { ...m };
}

export function patientFromCase(p: PatientDetails): PatientDetails {
  return { ...p };
}
