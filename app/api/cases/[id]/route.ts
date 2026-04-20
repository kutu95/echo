import { NextResponse } from "next/server";

import { deleteCaseFile, readCase } from "@/lib/server/case-files";

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const record = await readCase(params.id);
  if (!record) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
  return NextResponse.json({ case: record });
}

export async function DELETE(_: Request, { params }: Params) {
  await deleteCaseFile(params.id);
  return NextResponse.json({ ok: true });
}

