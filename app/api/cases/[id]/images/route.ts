import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { getUploadsPublicDir, readCase, saveCase } from "@/lib/server/case-files";
import type { CaseAttachment } from "@/types/models";

type Params = { params: { id: string } };

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function attachmentId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: Request, { params }: Params) {
  const record = await readCase(params.id);
  if (!record) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const dir = getUploadsPublicDir(params.id);
  await mkdir(dir, { recursive: true });

  const safeName = sanitizeFileName(file.name || "image");
  const stamped = `${Date.now()}-${safeName}`;
  const fullPath = path.join(dir, stamped);
  const bytes = new Uint8Array(await file.arrayBuffer());
  await writeFile(fullPath, bytes);

  const attachment: CaseAttachment = {
    id: attachmentId(),
    fileName: safeName,
    storedName: stamped,
    url: `/api/cases/${params.id}/images/${encodeURIComponent(stamped)}`,
    uploadedAt: new Date().toISOString(),
  };

  record.attachments = [...(record.attachments ?? []), attachment];
  record.updatedAt = new Date().toISOString();
  const saved = await saveCase(record);

  return NextResponse.json({ case: saved, attachment });
}

