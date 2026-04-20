import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

type Params = { params: { id: string; image: string } };

function mimeTypeFromName(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
}

export async function GET(_: Request, { params }: Params) {
  const safeImage = path.basename(decodeURIComponent(params.image));
  const fullPath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "cases",
    params.id,
    safeImage
  );

  try {
    const data = await readFile(fullPath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": mimeTypeFromName(safeImage),
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}

