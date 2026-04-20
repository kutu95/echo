import { NextResponse } from "next/server";

import { readCase, saveCase } from "@/lib/server/case-files";
import type { CaseRecord } from "@/types/models";

type Params = { params: { id: string } };

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(_: Request, { params }: Params) {
  const source = await readCase(params.id);
  if (!source) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const duplicated: CaseRecord = {
    ...source,
    id: uid(),
    title: `${source.title} (copy)`,
    createdAt: now,
    updatedAt: now,
  };
  const saved = await saveCase(duplicated);
  return NextResponse.json({ case: saved });
}

