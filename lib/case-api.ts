"use client";

import type { CaseRecord } from "@/types/models";

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function fetchCases() {
  const data = await parseJson<{ cases: CaseRecord[] }>(
    await fetch("/api/cases", { cache: "no-store" })
  );
  return data.cases;
}

export async function fetchCase(id: string) {
  const data = await parseJson<{ case: CaseRecord }>(
    await fetch(`/api/cases/${id}`, { cache: "no-store" })
  );
  return data.case;
}

export async function saveCaseToServer(record: CaseRecord) {
  const data = await parseJson<{ case: CaseRecord }>(
    await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case: record }),
    })
  );
  return data.case;
}

export async function deleteCaseFromServer(id: string) {
  await parseJson<{ ok: true }>(
    await fetch(`/api/cases/${id}`, { method: "DELETE" })
  );
}

export async function duplicateCaseOnServer(id: string) {
  const data = await parseJson<{ case: CaseRecord }>(
    await fetch(`/api/cases/${id}/duplicate`, { method: "POST" })
  );
  return data.case;
}

export async function uploadCaseImage(caseId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const data = await parseJson<{ case: CaseRecord }>(
    await fetch(`/api/cases/${caseId}/images`, {
      method: "POST",
      body: formData,
    })
  );
  return data.case;
}

