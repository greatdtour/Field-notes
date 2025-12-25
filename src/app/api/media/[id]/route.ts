import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const media = await prisma.media.findUnique({ where: { id: params.id } });
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = Buffer.from(media.data);
  return new NextResponse(body as unknown as BodyInit, {
    headers: {
      "Content-Type": media.mimeType,
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
}
