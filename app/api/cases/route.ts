import { NextResponse } from "next/server";

import type { CaseRecord } from "@/types/models";
import { listCases, saveCase } from "@/lib/server/case-files";

export async function GET() {
  const cases = await listCases();
  return NextResponse.json({ cases });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { case: CaseRecord };
  if (!body?.case?.id) {
    return NextResponse.json({ error: "Missing case payload" }, { status: 400 });
  }
  const saved = await saveCase(body.case);
  return NextResponse.json({ case: saved });
}

